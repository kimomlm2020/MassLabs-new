import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';

// Get cart
const getUserCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    const cartData = user?.cartData || {};
    
    res.json({ success: true, cartData });
  } catch (error) {
    console.error('Get Cart Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    
    if (!itemId) {
      return res.json({ success: false, message: "Product ID required" });
    }

    // Vérifier produit existe
    const product = await productModel.findById(itemId);
    if (!product || !product.isActive) {
      return res.json({ success: false, message: "Product not available" });
    }

    const user = await userModel.findById(req.userId);
    let cartData = user.cartData || {};
    
    const currentQty = cartData.get(itemId) || 0;
    const newQty = currentQty + quantity;

    if (newQty > 10) {
      return res.json({ success: false, message: "Maximum 10 units per product" });
    }

    if (newQty > product.stock) {
      return res.json({ success: false, message: `Only ${product.stock} available` });
    }

    cartData.set(itemId, newQty);
    user.cartData = cartData;
    await user.save();

    res.json({ success: true, cartData: Object.fromEntries(cartData) });
  } catch (error) {
    console.error('Add to Cart Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Update quantity
const updateCart = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    
    const user = await userModel.findById(req.userId);
    let cartData = user.cartData || {};

    if (quantity <= 0) {
      cartData.delete(itemId);
    } else {
      if (quantity > 10) {
        return res.json({ success: false, message: "Maximum 10 units" });
      }
      cartData.set(itemId, quantity);
    }

    user.cartData = cartData;
    await user.save();

    res.json({ success: true, cartData: Object.fromEntries(cartData) });
  } catch (error) {
    console.error('Update Cart Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    
    const user = await userModel.findById(req.userId);
    let cartData = user.cartData || {};
    
    cartData.delete(itemId);
    
    user.cartData = cartData;
    await user.save();

    res.json({ success: true, cartData: Object.fromEntries(cartData) });
  } catch (error) {
    console.error('Remove from Cart Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });
    res.json({ success: true, cartData: {} });
  } catch (error) {
    console.error('Clear Cart Error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Sync cart (batch update)
const syncCart = async (req, res) => {
  try {
    const { cartData } = req.body;
    
    // Nettoyer et valider
    const cleaned = new Map();
    for (const [id, qty] of Object.entries(cartData)) {
      if (qty > 0 && qty <= 10) {
        cleaned.set(id, qty);
      }
    }

    await userModel.findByIdAndUpdate(req.userId, { cartData: cleaned });
    res.json({ success: true, cartData: Object.fromEntries(cleaned) });
  } catch (error) {
    console.error('Sync Cart Error:', error);
    res.json({ success: false, message: error.message });
  }
};

export {
  getUserCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
  syncCart
};