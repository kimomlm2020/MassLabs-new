import React, { useContext, useEffect, useState, useCallback } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import '../styles/Cart.scss';

// ✅ CONSTANTES DE LIVRAISON
const SHIPPING_COST = 30;
const FREE_SHIPPING_THRESHOLD = 200;

const Cart = () => {

  const { 
    products, 
    currency, 
    cartItems, 
    updateQuantity, 
    removeFromCart,
    clearCart,
    navigate,
    getCartCount // ✅ Ajouté pour forcer le re-render
  } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [isClearing, setIsClearing] = useState(false); // ✅ État pour animation de vidage

  // ✅ LOGIQUE OPTIMISÉE - Écoute les changements de cartItems
  useEffect(() => {
    console.log('Cart items updated:', cartItems); // Debug
    
    if (products.length > 0) {
      const tempData = [];
      
      for (const itemId in cartItems) {
        const quantity = cartItems[itemId];
        if (quantity > 0) {
          const product = products.find(p => p._id === itemId);
          if (product) {
            tempData.push({
              ...product,
              _id: itemId,
              quantity: quantity,
              cartKey: itemId
            });
          }
        }
      }
      
      setCartData(tempData);
    } else {
      setCartData([]);
    }
  }, [cartItems, products]); // ✅ Dépendances correctes

  // ✅ FORCER LE RE-RENDER quand le panier est vide
  useEffect(() => {
    if (isClearing && Object.keys(cartItems).length === 0) {
      setIsClearing(false);
      setCartData([]);
    }
  }, [cartItems, isClearing]);

  // ✅ CALCULS AVEC LIVRAISON
  const itemCount = cartData.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const isFreeShipping = shippingCost === 0;
  const total = subtotal + shippingCost;
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const isEmpty = cartData.length === 0 || Object.keys(cartItems).length === 0; // ✅ Double vérification

  // ✅ Handlers optimisés
  const handleQuantityChange = useCallback((itemId, value) => {
    if (value === '' || value === '0') return;
    const num = Number(value);
    if (num < 1) {
      handleRemove(itemId);
    } else if (num > 10) {
      return;
    } else {
      updateQuantity(itemId, num);
    }
  }, [updateQuantity]);

  const handleRemove = useCallback((itemId) => {
    if (removeFromCart) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, 0);
    }
  }, [removeFromCart, updateQuantity]);

  const handleClear = useCallback(async () => { // ✅ Async pour attendre
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setIsClearing(true);
      await clearCart(); // ✅ Attendre que clearCart termine
      setCartData([]); // ✅ Vider immédiatement l'affichage
      setIsClearing(false);
    }
  }, [clearCart]);

  const handleCheckout = () => {
    if (cartData.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/place-order');
  };

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  // ✅ Affichage du panier vide si cartItems est vide
  if (isEmpty || Object.keys(cartItems).length === 0) {
    return (
      <div className="app cart-page">
        <div className="cart-empty">
          <div className="empty-content">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <button className="btn-primary" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app cart-page">
      <div className="cart-container">
        
        <div className="cart-header">
          <h1>Your Cart</h1>
          <p>{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartData.map((item) => (
              <div key={item.cartKey} className="cart-item">
                <div className="product-item">
                  
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
                  
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-meta">
                      {item.category}
                    </p>
                    {item.concentration && (
                      <span className="concentration-tag">{item.concentration}</span>
                    )}
                  </div>
                  
                  <div className="item-price-section">
                    <span className="unit-price">
                      {currency}{item.price?.toFixed(2)}
                    </span>
                  </div>

                  <div className="item-quantity">
                    <button 
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                      className="qty-value"
                    />
                    <button 
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      disabled={item.quantity >= 10}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    <span className="line-total">
                      {currency}{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemove(item._id)}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <div className="cart-secondary-actions">
              <button className="btn-continue" onClick={handleContinueShopping}>
                ← Continue Shopping
              </button>
              <button 
                className="btn-clear" 
                onClick={handleClear}
                disabled={isClearing} // ✅ Désactivé pendant le vidage
              >
                {isClearing ? 'Clearing...' : 'Clear Cart'}
              </button>
            </div>
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal ({itemCount} items)</span>
              <span>{currency}{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row shipping-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid #333',
              alignItems: 'center'
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
                  <>
                    <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '8px' }}>
                      {currency}{SHIPPING_COST.toFixed(2)}
                    </span>
                    £0.00
                  </>
                ) : (
                  `${currency}${shippingCost.toFixed(2)}`
                )}
              </span>
            </div>

            {!isFreeShipping && (
              <div style={{
                background: '#1a1a2e',
                borderRadius: '8px',
                padding: '15px',
                margin: '15px 0',
                border: '1px solid #333'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#888' }}>Add more for free shipping</span>
                  <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>
                    {currency}{amountForFreeShipping.toFixed(2)} left
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#333',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #D4AF37, #635BFF)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <p style={{
                  color: '#888',
                  fontSize: '12px',
                  margin: '10px 0 0 0',
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
                margin: '15px 0',
                textAlign: 'center'
              }}>
                <span style={{ color: '#4CAF50', fontSize: '14px' }}>
                  🎉 Congratulations! You qualify for free shipping!
                </span>
              </div>
            )}
            
            <div className="summary-row grand-total">
              <span>Total</span>
              <span>{currency}{total.toFixed(2)}</span>
            </div>
            
            <button 
              className="btn-checkout" 
              onClick={handleCheckout}
              disabled={isEmpty} // ✅ Désactivé si vide
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart;