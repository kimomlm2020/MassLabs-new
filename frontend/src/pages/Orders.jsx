import React, { useContext, useEffect, useState, useCallback } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useLocation } from 'react-router-dom';
import { 
  Package, Truck, CheckCircle, Clock, AlertCircle, RefreshCw, MapPin, CreditCard
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import '../styles/Orders.css';

const PAYMENT_METHOD_NAMES = {
  stripe: 'Stripe',
  paypal: 'PayPal',
  cod: 'Cash on Delivery',
  'bank-transfer': 'Bank Transfer',
  razorpay: 'Razorpay',
  crypto: 'Cryptocurrency'
};

const STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

const Orders = () => {
  const { backendUrl, token, currency, navigate } = useContext(ShopContext);
  const location = useLocation();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);
  const [filter, setFilter] = useState('all');

  const getImageUrl = (item) => {
    if (!item) return '/placeholder.png';
    
    let imagePath = null;
    
    if (Array.isArray(item.image) && item.image.length > 0) {
      imagePath = item.image[0];
    } else if (typeof item.image === 'string') {
      imagePath = item.image;
    } else if (Array.isArray(item.images) && item.images.length > 0) {
      imagePath = item.images[0];
    }
    
    if (!imagePath) return '/placeholder.png';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      return `${backendUrl}${imagePath}`;
    }
    
    return `${backendUrl}/uploads/${imagePath}`;
  };

  const loadOrders = useCallback(async (forceRefresh = false) => {
    setError(null);
    setLoading(true);

    if (!token) {
      setError('Please login to view your orders.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/order/userorders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
        
        if (forceRefresh && data.orders.length > 0) {
          const latestOrder = data.orders[0];
          const isNew = latestOrder.payment && 
                       new Date(latestOrder.date) > new Date(Date.now() - 5 * 60 * 1000);
          
          if (isNew) {
            setNewOrderId(latestOrder._id);
            toast.success(`Order #${latestOrder._id?.slice(-8).toUpperCase()} confirmed!`);
            setTimeout(() => setNewOrderId(null), 5000);
          }
        }
      } else {
        throw new Error(data.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Orders error:', err);
      setError(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    const fromPayment = location.state?.fromPayment || sessionStorage.getItem('cartCleared');
    
    if (fromPayment) {
      sessionStorage.removeItem('cartCleared');
      loadOrders(true);
    } else {
      loadOrders();
    }
  }, [loadOrders, location]);

  useEffect(() => {
    if (!token) return;
    
    const hasPending = orders.some(o => o.status === 'pending' && !o.payment);
    if (!hasPending) return;

    const interval = setInterval(() => {
      loadOrders(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [orders, token, loadOrders]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <CheckCircle size={16} />;
      case 'shipped':   return <Truck size={16} />;
      case 'processing':return <Package size={16} />;
      case 'paid':      return <CreditCard size={16} />;
      case 'pending':   return <Clock size={16} />;
      default:          return <AlertCircle size={16} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'shipped':   return 'status-shipped';
      case 'processing':return 'status-processing';
      case 'paid':      return 'status-paid';
      case 'pending':   return 'status-pending';
      default:          return 'status-default';
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return 'Address not provided';
    const parts = [
      addr.firstName && addr.lastName && `${addr.firstName} ${addr.lastName}`,
      addr.street,
      addr.city,
      addr.state,
      addr.zipcode,
      addr.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  const isNewOrder = (order) => {
    return order._id === newOrderId || 
           (order.payment && new Date(order.date) > new Date(Date.now() - 2 * 60 * 1000));
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter || (filter === 'unpaid' && !o.payment));

  const stats = {
    total: orders.length,
    paid: orders.filter(o => o.payment).length,
    pending: orders.filter(o => !o.payment).length,
    totalSpent: orders.reduce((sum, o) => sum + (o.amount || 0), 0)
  };

  if (!token) {
    return (
      <div className="orders-page">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <div className="orders-container">
          <div className="orders-empty">
            <div className="orders-empty__icon">🔐</div>
            <h2>Login Required</h2>
            <p>Please login to view your orders.</p>
            <button onClick={() => navigate('/login')} className="btn-gold">
              Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-page">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <div className="orders-loader">
          <div className="orders-loader__spinner" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <div className="orders-container">
          <div className="orders-error">
            <AlertCircle size={64} />
            <p>{error}</p>
            <button onClick={loadOrders} className="btn-gold">
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="orders-page">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <div className="orders-container">
        <div className="orders-header">
          <h1 className="orders-title">
            <span>MY</span>
            <span className="gold">ORDERS</span>
          </h1>
          <button onClick={() => loadOrders(true)} className="btn-refresh">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {orders.length > 0 && (
          <div className="orders-stats">
            <div className="stat-card">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.paid}</span>
              <span className="stat-label">Paid</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{currency}{stats.totalSpent.toFixed(2)}</span>
              <span className="stat-label">Total Spent</span>
            </div>
          </div>
        )}

        <div className="orders-filter">
          {['all', 'pending', 'paid', 'processing', 'shipped', 'delivered'].map(f => (
            <button 
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <Package size={64} className="orders-empty__icon" />
            <p>{filter === 'all' ? 'No orders found.' : `No ${filter} orders.`}</p>
            <button onClick={() => navigate('/shop')} className="btn-gold">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div 
                key={order._id} 
                className={`order-card ${order.payment ? 'paid' : ''} ${isNewOrder(order) ? 'new' : ''}`}
              >
                <div className="order-card__header">
                  <div className="order-card__meta">
                    <span className="order-card__id">
                      Order <strong>#{order._id?.slice(-8).toUpperCase()}</strong>
                      {isNewOrder(order) && <span className="new-badge">NEW</span>}
                    </span>
                    <span className="order-card__date">
                      {order.date ? new Date(order.date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }) : 'Unknown date'}
                    </span>
                  </div>
                  <span className={`order-card__status ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{STATUS_LABELS[order.status] || order.status || 'Pending'}</span>
                  </span>
                </div>

                <div className="order-card__items">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <div className="order-item__image">
                        <img 
                          src={getImageUrl(item)}
                          alt={item.name || 'Product'}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder.png';
                          }}
                        />
                      </div>
                      <div className="order-item__details">
                        <div className="order-item__header">
                          <div>
                            <h3 className="order-item__name">{item.name}</h3>
                            <p className="order-item__category">
                              {item.category} • {item.subCategory}
                            </p>
                          </div>
                          <p className="order-item__price-total">
                            {currency}{(item.price * (item.quantity || 1)).toFixed(2)}
                          </p>
                        </div>
                        <div className="order-item__specs">
                          <span className="spec-badge">{currency}{item.price} / unit</span>
                          {item.quantity > 1 && (
                            <span className="spec-badge">Qty: {item.quantity}</span>
                          )}
                          {item.concentration && (
                            <span className="spec-badge gold">{item.concentration}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card__footer">
                  <div className="order-card__info">
                    <div className="info-row">
                      <span>Payment:</span>
                      <span>{PAYMENT_METHOD_NAMES[order.paymentMethod] || order.paymentMethod || 'N/A'}</span>
                      <span className={`payment-badge ${order.payment ? 'paid' : 'pending'}`}>
                        {order.payment ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                    {order.trackingNumber && (
                      <div className="info-row">
                        <span>Tracking:</span>
                        <code className="tracking-code">{order.trackingNumber}</code>
                      </div>
                    )}
                  </div>
                  <div className="order-total">
                    <span className="order-total__label">Total</span>
                    <span className="order-total__amount">
                      {currency}{(order.amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {order.address && (
                  <div className="order-address">
                    <MapPin size={16} />
                    <p>{formatAddress(order.address)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Orders;