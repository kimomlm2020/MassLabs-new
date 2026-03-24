import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const CURRENCY = 'eur';
const SHIPPING_COST = 30;
const FREE_SHIPPING_THRESHOLD = 200;

// ============ HELPERS ============

const prepareOrderItems = (items) => {
  return items.map(item => ({
    productId: item.productId || item._id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: Array.isArray(item.image) ? item.image[0] : item.image,
    category: item.category || 'general',
    subCategory: item.subCategory || item.category || 'general',
    sku: item.sku || `SKU-${(item.productId || item._id).slice(-6).toUpperCase()}`,
    specifications: {
      concentration: item.concentration || null,
      volume: item.volume || null,
      form: item.form || null
    }
  }));
};

const prepareAddress = (addressData) => {
  const address = {
    firstName: addressData.firstName?.trim() || '',
    lastName: addressData.lastName?.trim() || '',
    email: addressData.email?.trim().toLowerCase() || '',
    phone: addressData.phone?.trim() || '',
    street: addressData.street?.trim() || '',
    apartment: addressData.apartment?.trim() || '',
    city: addressData.city?.trim() || '',
    state: addressData.state?.trim() || '',
    zipcode: addressData.zipcode?.trim() || '',
    country: addressData.country?.trim() || 'FR'
  };
  
  address.fullName = `${address.firstName} ${address.lastName}`.trim();
  return address;
};

const getValidImageUrl = (item) => {
  let imageUrl = null;
  
  if (Array.isArray(item.image) && item.image.length > 0 && item.image[0]) {
    imageUrl = item.image[0];
  } else if (typeof item.image === 'string' && item.image.trim() !== '' && item.image !== 'undefined') {
    imageUrl = item.image;
  } else if (Array.isArray(item.images) && item.images.length > 0 && item.images[0]) {
    imageUrl = item.images[0];
  }
  
  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return imageUrl;
  }
  return null;
};

// ============ PLACE ORDER STRIPE ============

export const placeOrderStripe = async (req, res) => {
  try {
    const { items, amount, subtotal, shippingCost, isFreeShipping, address } = req.body;
    const userId = req.userId;
    
    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    const cleanOrigin = origin.replace(/\/$/, '');

    if (!items || items.length === 0) {
      return res.json({ success: false, message: "Cart is empty" });
    }

    if (!address?.email || !address.email.includes('@')) {
      return res.json({ success: false, message: "Valid email required" });
    }

    const orderData = {
      userId,
      items: prepareOrderItems(items),
      amount: Number(amount),
      subtotal: Number(subtotal),
      shipping: Number(shippingCost) || 0,
      address: prepareAddress(address),
      paymentMethod: 'stripe',
      status: 'pending',
      date: new Date()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map(item => {
      const productData = {
        name: item.name?.substring(0, 100)
      };
      
      const validImage = getValidImageUrl(item);
      if (validImage) {
        productData.images = [validImage.substring(0, 2000)];
      }
      
      return {
        price_data: {
          currency: CURRENCY,
          product_data: productData,
          unit_amount: Math.round((item.price || 0) * 100)
        },
        quantity: Math.min(Math.max(parseInt(item.quantity) || 1, 1), 99)
      };
    });

    if (!isFreeShipping && shippingCost > 0) {
      line_items.push({
        price_data: {
          currency: CURRENCY,
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(shippingCost * 100)
        },
        quantity: 1
      });
    }

    const successUrl = `${cleanOrigin}/verify-order?success=true&orderId=${newOrder._id.toString()}`;
    const cancelUrl = `${cleanOrigin}/verify-order?success=false&orderId=${newOrder._id.toString()}`;

    const sessionConfig = {
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items,
      mode: 'payment',
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId.toString()
      }
    };

    const customerEmail = address?.email?.trim().toLowerCase();
    if (customerEmail && customerEmail.includes('@') && customerEmail.length < 256) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    newOrder.stripeSessionId = session.id;
    await newOrder.save();

    res.json({
      success: true,
      sessionUrl: session.url,
      orderId: newOrder._id
    });

  } catch (error) {
    console.error('Place Order Stripe Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// ============ VERIFY STRIPE ============

export const verifyStripe = async (req, res) => {
  try {
    const { orderId, success } = req.body;
    const userId = req.userId;

    if (success === 'true' || success === true) {
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId, 
        {
          payment: true,
          status: 'paid',
          paymentDate: new Date()
        },
        { new: true }
      );

      if (!updatedOrder) {
        return res.json({ success: false, message: 'Order not found' });
      }

      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      res.json({ success: true, message: 'Payment successful', order: updatedOrder });
    } else {
      await orderModel.findByIdAndUpdate(orderId, { status: 'cancelled' });
      res.json({ success: false, message: 'Payment cancelled' });
    }
  } catch (error) {
    console.error('Verify Stripe Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// ============ USER ORDERS ============

export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId })
      .sort({ date: -1 })
      .lean();
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('User Orders Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// ============ ALL ORDERS (Admin) ============

export const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find()
      .sort({ date: -1 })
      .populate('userId', 'name email')
      .lean();
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('All Orders Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// ============ UPDATE STATUS ============

export const updateStatus = async (req, res) => {
  try {
    const { orderId, status, trackingNumber, carrier } = req.body;
    
    const updateData = { status };
    
    if (status === 'shipped') {
      updateData.trackingNumber = trackingNumber;
      updateData.carrier = carrier;
      updateData.shippedAt = new Date();
    }
    
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    await orderModel.findByIdAndUpdate(orderId, updateData);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// ============ GET ORDER DETAILS ============

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const isAdmin = req.userRole === 'admin';

    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    if (!isAdmin && order.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get Order Details Error:', error);
    res.json({ success: false, message: error.message });
  }
};