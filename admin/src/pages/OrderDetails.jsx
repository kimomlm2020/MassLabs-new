import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  CreditCard,
  Calendar,
  Printer,
  Download,
  Edit2,
  Save,
  X,
  ChevronRight,
  Box,
  User,
  Phone,
  Mail,
  Hash
} from 'lucide-react';
import '../styles/OrderDetails.scss';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [trackingForm, setTrackingForm] = useState({
    carrier: '',
    number: ''
  });
  const [showTrackingForm, setShowTrackingForm] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const token = localStorage.getItem('adminToken');

  // Status configuration
  const statusConfig = {
    pending: { 
      label: 'Pending', 
      color: '#FF9800', 
      icon: Clock,
      description: 'Order received, awaiting payment confirmation'
    },
    paid: { 
      label: 'Paid', 
      color: '#2196F3', 
      icon: CheckCircle,
      description: 'Payment confirmed, preparing for shipment'
    },
    processing: { 
      label: 'Processing', 
      color: '#9c27b0', 
      icon: Package,
      description: 'Order is being prepared and packed'
    },
    shipped: { 
      label: 'Shipped', 
      color: '#673ab7', 
      icon: Truck,
      description: 'Order has been dispatched'
    },
    delivered: { 
      label: 'Delivered', 
      color: '#4CAF50', 
      icon: CheckCircle,
      description: 'Order delivered successfully'
    },
    cancelled: { 
      label: 'Cancelled', 
      color: '#f44336', 
      icon: X,
      description: 'Order has been cancelled'
    },
    refunded: { 
      label: 'Refunded', 
      color: '#607d8b', 
      icon: AlertCircle,
      description: 'Payment has been refunded'
    }
  };

  const carriers = [
    { code: 'dhl', name: 'DHL Express' },
    { code: 'fedex', name: 'FedEx' },
    { code: 'ups', name: 'UPS' },
    { code: 'tnt', name: 'TNT' },
    { code: 'usps', name: 'USPS' },
    { code: 'chronopost', name: 'Chronopost' },
    { code: 'colissimo', name: 'Colissimo' },
    { code: 'other', name: 'Other' }
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/order/details/${orderId}`,
        { headers: { token } }
      );

      if (response.data.success) {
        setOrder(response.data.order);
        // Generate mock status history if not provided
        setStatusHistory([
          { status: 'pending', date: response.data.order.date, note: 'Order placed' },
          ...(response.data.order.paymentDate ? [{ 
            status: 'paid', 
            date: response.data.order.paymentDate, 
            note: 'Payment confirmed' 
          }] : []),
          ...(response.data.order.shippedAt ? [{ 
            status: 'shipped', 
            date: response.data.order.shippedAt, 
            note: `Shipped via ${response.data.order.carrier || 'carrier'}` 
          }] : []),
          ...(response.data.order.deliveredAt ? [{ 
            status: 'delivered', 
            date: response.data.order.deliveredAt, 
            note: 'Delivered to customer' 
          }] : [])
        ]);
      } else {
        toast.error('Order not found');
        navigate('/admin/orders');
      }
    } catch (error) {
      toast.error('Failed to load order details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus, trackingInfo = null) => {
    try {
      const updateData = { orderId, status: newStatus };
      if (trackingInfo) {
        updateData.carrier = trackingInfo.carrier;
        updateData.trackingNumber = trackingInfo.number;
      }

      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        updateData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrderDetails();
        setShowTrackingForm(false);
        setTrackingForm({ carrier: '', number: '' });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const orderData = {
      id: order._id,
      date: order.date,
      customer: order.address,
      items: order.items,
      totals: {
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.amount
      }
    };
    
    const blob = new Blob([JSON.stringify(orderData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${order._id.slice(-8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Order exported');
  };

  const getNextStatus = (current) => {
    const flow = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const getAvailableActions = (status) => {
    const actions = [];
    
    if (status === 'pending') {
      actions.push({ label: 'Mark as Paid', status: 'paid', variant: 'primary' });
      actions.push({ label: 'Cancel Order', status: 'cancelled', variant: 'danger' });
    }
    
    if (status === 'paid') {
      actions.push({ label: 'Start Processing', status: 'processing', variant: 'primary' });
    }
    
    if (status === 'processing') {
      actions.push({ label: 'Mark as Shipped', status: 'shipped', variant: 'primary', requiresTracking: true });
    }
    
    if (status === 'shipped') {
      actions.push({ label: 'Mark as Delivered', status: 'delivered', variant: 'success' });
    }
    
    return actions;
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  const nextStatus = getNextStatus(order.status);
  const availableActions = getAvailableActions(order.status);

  return (
    <div className="order-details-page">
      {/* Header */}
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft size={20} />
          Back to Orders
        </button>
        
        <div className="header-actions">
          <button className="btn-secondary" onClick={handlePrint}>
            <Printer size={18} />
            Print
          </button>
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Order Title */}
      <div className="order-title-section">
        <div>
          <h1>Order #{order._id?.slice(-8).toUpperCase()}</h1>
          <p className="order-meta">
            Placed on {new Date(order.date).toLocaleDateString('en-GB', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        
        <div className="status-badge-large" style={{ 
          backgroundColor: `${statusConfig[order.status]?.color}20`,
          color: statusConfig[order.status]?.color,
          borderColor: statusConfig[order.status]?.color
        }}>
          <StatusIcon size={20} />
          <span>{statusConfig[order.status]?.label}</span>
        </div>
      </div>

      <div className="order-content-grid">
        {/* Left Column - Main Info */}
        <div className="order-main">
          {/* Status Progress */}
          <div className="card status-timeline-card">
            <h3>Order Status</h3>
            <div className="status-timeline">
              {['pending', 'paid', 'processing', 'shipped', 'delivered'].map((status, idx) => {
                const isCompleted = statusHistory.some(h => h.status === status);
                const isCurrent = order.status === status;
                const statusInfo = statusConfig[status];
                
                return (
                  <div 
                    key={status} 
                    className={`timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="timeline-icon" style={{
                      backgroundColor: isCompleted || isCurrent ? statusInfo.color : 'transparent',
                      borderColor: statusInfo.color
                    }}>
                      <statusInfo.icon size={16} color={isCompleted || isCurrent ? '#fff' : statusInfo.color} />
                    </div>
                    <div className="timeline-content">
                      <span className="timeline-label">{statusInfo.label}</span>
                      {isCompleted && (
                        <span className="timeline-date">
                          {new Date(statusHistory.find(h => h.status === status)?.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {idx < 4 && <div className="timeline-line" />}
                  </div>
                );
              })}
            </div>

            {/* Status Actions */}
            {availableActions.length > 0 && (
              <div className="status-actions">
                <h4>Update Status</h4>
                <div className="action-buttons">
                  {availableActions.map(action => (
                    <button
                      key={action.status}
                      className={`btn-action ${action.variant}`}
                      onClick={() => {
                        if (action.requiresTracking) {
                          setShowTrackingForm(true);
                        } else {
                          updateStatus(action.status);
                        }
                      }}
                    >
                      {action.label}
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>

                {/* Tracking Form */}
                {showTrackingForm && (
                  <div className="tracking-form">
                    <h5>Shipping Information</h5>
                    <div className="form-row">
                      <select
                        value={trackingForm.carrier}
                        onChange={(e) => setTrackingForm({...trackingForm, carrier: e.target.value})}
                      >
                        <option value="">Select Carrier</option>
                        {carriers.map(c => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Tracking Number"
                        value={trackingForm.number}
                        onChange={(e) => setTrackingForm({...trackingForm, number: e.target.value})}
                      />
                    </div>
                    <div className="form-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => setShowTrackingForm(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={() => updateStatus('shipped', trackingForm)}
                        disabled={!trackingForm.carrier || !trackingForm.number}
                      >
                        <Save size={16} />
                        Confirm Shipment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="card items-card">
            <h3>Order Items ({order.items?.length || 0})</h3>
            <div className="items-list">
              {order.items?.map((item, idx) => (
                <div key={idx} className="order-item">
                  <div className="item-image">
                    <img 
                      src={item.image?.[0] || '/placeholder.png'} 
                      alt={item.name}
                      onError={(e) => e.target.src = '/placeholder.png'}
                    />
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p className="item-meta">
                      {item.category} • {item.subCategory}
                      {item.sku && <span className="sku">SKU: {item.sku}</span>}
                    </p>
                    {item.specifications && (
                      <div className="item-specs">
                        {item.specifications.concentration && (
                          <span className="spec-tag">{item.specifications.concentration}</span>
                        )}
                        {item.specifications.volume && (
                          <span className="spec-tag">{item.specifications.volume}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="item-pricing">
                    <span className="item-price">£{item.price?.toFixed(2)}</span>
                    <span className="item-qty">× {item.quantity}</span>
                    <span className="item-total">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>£{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'FREE' : `£${order.shipping?.toFixed(2)}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-£{order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>£{order.amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="card payment-card">
            <h3><CreditCard size={18} /> Payment Information</h3>
            <div className="payment-details">
              <div className="payment-row">
                <span className="label">Payment Method</span>
                <span className="value method">
                  {order.paymentMethod === 'stripe' && '💳 Credit Card (Stripe)'}
                  {order.paymentMethod === 'paypal' && '🅿️ PayPal'}
                  {order.paymentMethod === 'cod' && '💵 Cash on Delivery'}
                </span>
              </div>
              <div className="payment-row">
                <span className="label">Payment Status</span>
                <span className={`value status ${order.payment ? 'paid' : 'pending'}`}>
                  {order.payment ? '✓ Paid' : '⏳ Pending'}
                </span>
              </div>
              {order.payment && order.paymentDate && (
                <div className="payment-row">
                  <span className="label">Paid On</span>
                  <span className="value">
                    {new Date(order.paymentDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {order.stripeSessionId && (
                <div className="payment-row">
                  <span className="label">Transaction ID</span>
                  <span className="value transaction-id">{order.stripeSessionId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="order-sidebar">
          {/* Customer Info */}
          <div className="card customer-card">
            <h3><User size={18} /> Customer</h3>
            <div className="customer-details">
              <div className="detail-row">
                <Hash size={16} />
                <span>ID: {order.userId?.slice(-8)}</span>
              </div>
              <div className="detail-row name">
                <span>{order.address?.firstName} {order.address?.lastName}</span>
              </div>
              <div className="detail-row">
                <Mail size={16} />
                <a href={`mailto:${order.address?.email}`}>{order.address?.email}</a>
              </div>
              <div className="detail-row">
                <Phone size={16} />
                <a href={`tel:${order.address?.phone}`}>{order.address?.phone}</a>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card address-card">
            <h3><MapPin size={18} /> Shipping Address</h3>
            <div className="address-display">
              <p className="name">{order.address?.firstName} {order.address?.lastName}</p>
              <p>{order.address?.street}</p>
              {order.address?.apartment && <p>{order.address?.apartment}</p>}
              <p>{order.address?.city}, {order.address?.state} {order.address?.zipcode}</p>
              <p className="country">
                {new Intl.DisplayNames(['en'], { type: 'region' }).of(order.address?.country)}
              </p>
            </div>
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="card tracking-card">
              <h3><Truck size={18} /> Shipment Tracking</h3>
              <div className="tracking-info">
                <div className="tracking-row">
                  <span className="label">Carrier</span>
                  <span className="value">{order.carrier?.toUpperCase()}</span>
                </div>
                <div className="tracking-row">
                  <span className="label">Tracking #</span>
                  <span className="value tracking-number">{order.trackingNumber}</span>
                </div>
                <a 
                  href={`https://track24.net/?code=${order.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="track-link"
                >
                  Track Package
                  <ChevronRight size={16} />
                </a>
              </div>
            </div>
          )}

          {/* Order Timeline/History */}
          <div className="card history-card">
            <h3><Calendar size={18} /> Activity History</h3>
            <div className="history-list">
              {statusHistory.map((event, idx) => {
                const EventIcon = statusConfig[event.status]?.icon || Clock;
                return (
                  <div key={idx} className="history-item">
                    <div className="history-icon" style={{
                      backgroundColor: `${statusConfig[event.status]?.color}20`,
                      color: statusConfig[event.status]?.color
                    }}>
                      <EventIcon size={14} />
                    </div>
                    <div className="history-content">
                      <p className="history-status">{statusConfig[event.status]?.label}</p>
                      <p className="history-note">{event.note}</p>
                      <p className="history-date">
                        {new Date(event.date).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;