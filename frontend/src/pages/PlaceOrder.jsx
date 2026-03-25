import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import '../styles/PlaceOrder.css';

const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'MA', name: 'Morocco' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'CI', name: "Ivory Coast" },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CD', name: 'Congo (Kinshasa)' },
  { code: 'CG', name: 'Congo (Brazzaville)' },
  { code: 'GA', name: 'Gabon' },
  { code: 'ML', name: 'Mali' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'NE', name: 'Niger' },
  { code: 'TG', name: 'Togo' },
  { code: 'BJ', name: 'Benin' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'BI', name: 'Burundi' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'AU', name: 'Australia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'MX', name: 'Mexico' },
  { code: 'RU', name: 'Russia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'TR', name: 'Turkey' }
];

// ✅ CONSTANTES DE LIVRAISON
const SHIPPING_COST = 30; // £30 de frais de livraison
const FREE_SHIPPING_THRESHOLD = 200; // Gratuit à partir de £200

const PlaceOrder = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [method, setMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  const [addressData, setAddressData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'FR'
  });

  const { 
    cartItems,
    products,
    currency, 
    backendUrl, 
    token, 
    clearCart,
    user 
  } = useContext(ShopContext);

  const navigate = useNavigate();

  // ✅ Get cart products - SANS SIZE
  const getCartProducts = useCallback(() => {
    const items = [];

    for (const itemId in cartItems) {
      const quantity = cartItems[itemId];
      if (typeof quantity === 'number' && quantity > 0) {
        const product = products.find(p => p._id === itemId);
        if (product) {
          items.push({
            ...product,
            quantity: quantity,
            cartKey: itemId
          });
        }
      }
    }
    return items;
  }, [cartItems, products]);

  const getSubtotalAmount = useCallback(() => {
    let total = 0;
    const cartProducts = getCartProducts();
    for (const item of cartProducts) {
      total += (item.price || 0) * (item.quantity || 0);
    }
    return total;
  }, [getCartProducts]);

  // ✅ CALCUL DES FRAIS DE LIVRAISON
  const getShippingCost = useCallback(() => {
    const subtotal = getSubtotalAmount();
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  }, [getSubtotalAmount]);

  // ✅ CALCUL DU TOTAL FINAL
  const getTotalAmount = useCallback(() => {
    const subtotal = getSubtotalAmount();
    const shipping = getShippingCost();
    return subtotal + shipping;
  }, [getSubtotalAmount, getShippingCost]);

  const cartProducts = getCartProducts();
  const subtotalAmount = getSubtotalAmount();
  const shippingCost = getShippingCost();
  const totalAmount = getTotalAmount();
  const isFreeShipping = shippingCost === 0;

  useEffect(() => {
    if (user) {
      setAddressData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!cartItems || Object.keys(cartItems).length === 0) {
      toast.info('Your cart is empty');
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const getUserId = useCallback(() => {
    if (user && user._id) return user._id;
    if (user && user.id) return user.id;

    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        return decoded.userId || decoded.id || decoded.sub || decoded._id;
      } catch (error) {
        return null;
      }
    }
    return null;
  }, [token, user]);

  // ✅ Get order items - SANS SIZE
  const getOrderItems = useCallback(() => {
    return cartProducts.map(item => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image?.[0] || item.images?.[0] || '',
      category: item.category || 'general',
      subCategory: item.subCategory || item.category || 'general',
      sku: item.sku || `SKU-${item._id?.slice(-6).toUpperCase() || 'TEMP'}`
    }));
  }, [cartProducts]);

  // ✅ STRIPE PAYMENT HANDLER
  const handleStripePayment = useCallback(async () => {
    setLoading(true);
    const userId = getUserId();

    if (!userId) {
      toast.error('Authentication error. Please login again.');
      setLoading(false);
      navigate('/login');
      return false;
    }

    try {
     const response = await axios.post(
  `${backendUrl}/api/order/stripe`, 
        {
          userId: userId,
          items: getOrderItems(),
          amount: totalAmount,
          subtotal: subtotalAmount,
          shippingCost: shippingCost,
          isFreeShipping: isFreeShipping,
          address: addressData,
          successUrl: `${window.location.origin}/order-success`,
          cancelUrl: `${window.location.origin}/cart`
        },
        { headers: { token } }
      );

      if (response.data?.success && response.data?.sessionUrl) {
        window.location.href = response.data.sessionUrl;
        return true;
      } else {
        throw new Error(response.data?.message || 'Failed to create checkout session');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Stripe payment failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token, getOrderItems, totalAmount, subtotalAmount, shippingCost, isFreeShipping, addressData, getUserId, navigate]);

  const onSubmitHandler = useCallback(async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Please login to place order');
      navigate('/login');
      return;
    }

    if (!cartProducts || cartProducts.length === 0) {
      toast.error('Your cart is empty');
      navigate('/shop');
      return;
    }

    const userId = getUserId();

    if (!userId) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    const validations = [
      { check: !addressData.email?.includes('@'), msg: 'Please enter a valid email' },
      { check: !addressData.firstName?.trim(), msg: 'Please enter your first name' },
      { check: !addressData.lastName?.trim(), msg: 'Please enter your last name' },
      { check: !addressData.street?.trim(), msg: 'Please enter your street address' },
      { check: !addressData.city?.trim(), msg: 'Please enter your city' },
      { check: !addressData.zipcode?.trim(), msg: 'Please enter your postal code' },
      { check: !addressData.country, msg: 'Please select your country' }
    ];

    for (const validation of validations) {
      if (validation.check) {
        toast.error(validation.msg);
        return;
      }
    }

    if (loading) return;

    await handleStripePayment();

  }, [token, addressData, loading, cartProducts, navigate, handleStripePayment, getUserId]);

  const updateAddress = (field, value) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
  };

  const ConfirmationPage = ({ data }) => {
    return (
      <div style={{
        maxWidth: '700px',
        margin: '60px auto',
        padding: '40px',
        background: '#000',
        border: '3px solid #D4AF37',
        borderRadius: '16px',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '80px', 
          marginBottom: '20px',
          animation: 'pulse 2s infinite'
        }}>
          ✅
        </div>

        <h1 style={{ 
          color: '#D4AF37', 
          fontSize: '28px', 
          marginBottom: '15px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Order Placed Successfully!
        </h1>

        <p style={{ 
          color: '#fff', 
          fontSize: '18px', 
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          You chose <strong style={{ color: '#D4AF37' }}>Credit/Debit Card</strong> via Stripe.
          <br />
          <span style={{ color: '#888', fontSize: '16px' }}>
            You will be redirected to complete your payment securely.
          </span>
        </p>

        <div style={{
          background: '#0a0a0a',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '30px',
          textAlign: 'left',
          border: '1px solid #333'
        }}>
          <h3 style={{ 
            color: '#D4AF37', 
            marginBottom: '20px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Order Details
          </h3>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '15px',
            paddingBottom: '15px',
            borderBottom: '1px solid #333'
          }}>
            <span style={{ color: '#888' }}>Order Reference:</span>
            <span style={{ color: '#D4AF37', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {data.order?.reference || data.order?._id?.slice(-8) || 'N/A'}
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '15px',
            paddingBottom: '15px',
            borderBottom: '1px solid #333'
          }}>
            <span style={{ color: '#888' }}>Subtotal:</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>
              {currency}{subtotalAmount.toFixed(2)}
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '15px',
            paddingBottom: '15px',
            borderBottom: '1px solid #333'
          }}>
            <span style={{ color: '#888' }}>Shipping:</span>
            <span style={{ 
              color: isFreeShipping ? '#4CAF50' : '#fff', 
              fontWeight: 'bold' 
            }}>
              {isFreeShipping ? 'FREE' : `${currency}${shippingCost.toFixed(2)}`}
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '15px',
            paddingBottom: '15px',
            borderBottom: '1px solid #333'
          }}>
            <span style={{ color: '#888' }}>Total Amount:</span>
            <span style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '20px' }}>
              {currency}{data.order?.amount?.toFixed(2) || totalAmount.toFixed(2)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Payment Method:</span>
            <span style={{ 
              background: '#635BFF',
              color: '#fff',
              padding: '5px 12px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '12px'
            }}>
              💳 Credit/Debit Card
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/orders')}
            style={{
              background: 'transparent',
              color: '#D4AF37',
              border: '2px solid #D4AF37',
              padding: '15px 30px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            View My Orders
          </button>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: '#D4AF37',
              color: '#000',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="app place-order-page">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <div className="place-order-container" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #333',
            borderTop: '4px solid #635BFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '30px'
          }} />
          <h2 style={{ color: '#635BFF', marginBottom: '15px' }}>
            Preparing secure checkout...
          </h2>
          <p style={{ color: '#888' }}>
            Please wait while we redirect you to Stripe
          </p>

          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
        <Footer />
      </div>
    );
  }

  if (showConfirmation && confirmationData) {
    return (
      <div className="app place-order-page">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <ConfirmationPage data={confirmationData} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="app place-order-page">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="place-order-container">
        <h1 className="page-title">Complete Your Order</h1>

        <div className="order-grid">
          <div className="delivery-info">
            <h2>Contact Information</h2>
            <form onSubmit={onSubmitHandler} noValidate>
              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="First Name *"
                  value={addressData.firstName}
                  onChange={(e) => updateAddress('firstName', e.target.value)}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Last Name *"
                  value={addressData.lastName}
                  onChange={(e) => updateAddress('lastName', e.target.value)}
                  required
                />
              </div>

              <input 
                type="email" 
                placeholder="Email *"
                value={addressData.email}
                onChange={(e) => updateAddress('email', e.target.value)}
                required
              />

              <input 
                type="tel" 
                placeholder="Phone *"
                value={addressData.phone}
                onChange={(e) => updateAddress('phone', e.target.value)}
                required
              />

              <h3 className="section-subtitle">Shipping Address</h3>

              <input 
                type="text" 
                placeholder="Street Address *"
                value={addressData.street}
                onChange={(e) => updateAddress('street', e.target.value)}
                required
              />

              <input 
                type="text" 
                placeholder="Apartment, Suite, Unit, etc. (Optional)"
                value={addressData.apartment}
                onChange={(e) => updateAddress('apartment', e.target.value)}
              />

              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="City *"
                  value={addressData.city}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  required
                />
                <input 
                  type="text" 
                  placeholder="State / Province / Region"
                  value={addressData.state}
                  onChange={(e) => updateAddress('state', e.target.value)}
                />
              </div>

              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="ZIP / Postal Code *"
                  value={addressData.zipcode}
                  onChange={(e) => updateAddress('zipcode', e.target.value)}
                  required
                />

                <select
                  value={addressData.country}
                  onChange={(e) => updateAddress('country', e.target.value)}
                  required
                  className="country-select"
                >
                  <option value="">Select Country *</option>
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="payment-methods">
                <h3>Payment Method</h3>

                <div className="stripe-payment-box" style={{
                  background: '#1a1a2e',
                  border: '2px solid #635BFF',
                  borderRadius: '12px',
                  padding: '20px',
                  marginTop: '15px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: '#635BFF',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      💳
                    </div>
                    <div>
                      <h4 style={{ 
                        color: '#fff', 
                        margin: '0 0 5px 0',
                        fontSize: '18px'
                      }}>
                        Credit/Debit Card
                      </h4>
                      <p style={{ 
                        color: '#888', 
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        Powered by Stripe
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    padding: '10px',
                    background: '#0f0f1e',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '24px' }}>💳</span>
                    <span style={{ fontSize: '24px' }}>🏦</span>
                    <span style={{ fontSize: '24px' }}>🛡️</span>
                    <span style={{ 
                      color: '#888', 
                      fontSize: '12px',
                      marginLeft: 'auto'
                    }}>
                      Secure SSL Encryption
                    </span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="place-order-btn"
                disabled={loading || cartProducts.length === 0}
                style={{
                  background: '#635BFF',
                  marginTop: '30px'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  `Pay ${currency}${totalAmount.toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          <div className="cart-total">
            <h2>Order Summary</h2>
            <div className="cart-items-summary">
              {cartProducts.map((item) => (
                <div key={item.cartKey} className="summary-item">
                  <div className="item-info">
                    <div className="item-image">
                      <img 
                        src={item.image?.[0] || '/images/default-product.jpg'} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/default-product.jpg';
                        }}
                      />
                    </div>
                    <div>
                      <p className="item-name">{item.name}</p>
                      <p className="item-details">
                        {item.category} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="item-price">
                    {currency}{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="total-row">
              <span>Subtotal ({cartProducts.length} items)</span>
              <span>{currency}{subtotalAmount.toFixed(2)}</span>
            </div>
            
            <div className="total-row shipping-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #333',
              marginBottom: '10px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Shipping
                {isFreeShipping && (
                  <span style={{
                    background: '#4CAF50',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    FREE
                  </span>
                )}
              </span>
              <span style={{ 
                color: isFreeShipping ? '#4CAF50' : 'inherit',
                fontWeight: isFreeShipping ? 'bold' : 'normal'
              }}>
                {isFreeShipping ? (
                  <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '8px' }}>
                    {currency}{SHIPPING_COST.toFixed(2)}
                  </span>
                ) : null}
                {isFreeShipping ? '£0.00' : `${currency}${shippingCost.toFixed(2)}`}
              </span>
            </div>

            {!isFreeShipping && (
              <div style={{
                background: '#1a1a2e',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '15px',
                border: '1px solid #333'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '12px'
                }}>
                  <span style={{ color: '#888' }}>Add more for free shipping</span>
                  <span style={{ color: '#D4AF37' }}>
                    {currency}{(FREE_SHIPPING_THRESHOLD - subtotalAmount).toFixed(2)} left
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#333',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min((subtotalAmount / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #D4AF37, #635BFF)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <p style={{
                  color: '#888',
                  fontSize: '11px',
                  margin: '8px 0 0 0',
                  textAlign: 'center'
                }}>
                  Free shipping on orders over {currency}{FREE_SHIPPING_THRESHOLD}
                </p>
              </div>
            )}

            {isFreeShipping && (
              <div style={{
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid #4CAF50',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                <span style={{ color: '#4CAF50', fontSize: '14px' }}>
                  🎉 Congratulations! You qualify for free shipping!
                </span>
              </div>
            )}

            <div className="total-row grand-total">
              <span>Total</span>
              <span>{currency}{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlaceOrder;