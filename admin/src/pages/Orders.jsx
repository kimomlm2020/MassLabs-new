import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Download, 
  Eye, 
  Truck, 
  CheckCircle,
  XCircle,
  Package
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/Orders.scss';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, trackingInfo = {}) => {
    try {
      await axios.post(
        `${backendUrl}/api/order/status`,
        {
          orderId,
          status: newStatus,
          ...trackingInfo
        },
        { headers: { token } }
      );

      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const exportOrders = () => {
    const csvContent = [
      ['Order ID', 'Customer', 'Email', 'Items', 'Amount', 'Status', 'Date'].join(','),
      ...orders.map(o => [
        o._id,
        `${o.address?.firstName || ''} ${o.address?.lastName || ''}`,
        o.address?.email || '',
        o.items?.length || 0,
        o.amount || 0,
        o.status,
        new Date(o.date).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Orders exported');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((sum, o) => sum + (o.amount || 0), 0)
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      paid: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#22c55e',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="admin-orders-page">
        <div className="loading-spinner">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Orders</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card paid">
          <span className="stat-value">{stats.paid}</span>
          <span className="stat-label">Paid</span>
        </div>
        <div className="stat-card processing">
          <span className="stat-value">{stats.processing}</span>
          <span className="stat-label">Processing</span>
        </div>
        <div className="stat-card shipped">
          <span className="stat-value">{stats.shipped}</span>
          <span className="stat-label">Shipped</span>
        </div>
        <div className="stat-card delivered">
          <span className="stat-value">{stats.delivered}</span>
          <span className="stat-label">Delivered</span>
        </div>
        <div className="stat-card revenue">
          <span className="stat-value">€{stats.revenue.toFixed(2)}</span>
          <span className="stat-label">Revenue</span>
        </div>
      </div>

      <div className="page-header">
        <h1>Orders Management</h1>
        <button className="btn-export" onClick={exportOrders}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by order ID, email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id}>
                <td>
                  <span className="order-id">#{order._id?.slice(-8).toUpperCase()}</span>
                </td>
                <td>
                  <div className="customer-info">
                    <span className="customer-name">
                      {order.address?.firstName} {order.address?.lastName}
                    </span>
                    <span className="customer-email">{order.address?.email}</span>
                  </div>
                </td>
                <td>
                  <div className="products-preview">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="product-thumb">
                        <img 
                          src={getImageUrl(item)}
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder.png';
                          }}
                        />
                        <span className="product-qty">{item.quantity}x</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="amount">€{order.amount?.toFixed(2)}</td>
                <td>
                  <span className={`payment-badge ${order.payment ? 'paid' : 'pending'}`}>
                    {order.payment ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="status-select"
                    style={{ borderColor: getStatusColor(order.status), color: getStatusColor(order.status) }}
                  >
                    {statusOptions.filter(s => s.value !== 'all').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailModal(true);
                      }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    
                    {order.status === 'paid' && (
                      <button 
                        onClick={() => updateOrderStatus(order._id, 'processing')}
                        title="Start Processing"
                        className="btn-process"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    
                    {order.status === 'processing' && (
                      <button 
                        onClick={() => {
                          const tracking = prompt('Enter tracking number:');
                          if (tracking) {
                            updateOrderStatus(order._id, 'shipped', { 
                              trackingNumber: tracking
                            });
                          }
                        }}
                        title="Mark as Shipped"
                        className="btn-ship"
                      >
                        <Truck size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details #{selectedOrder._id?.slice(-8).toUpperCase()}</h2>
              <button onClick={() => setShowDetailModal(false)}>
                <XCircle size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Customer</h3>
                <p><strong>{selectedOrder.address?.firstName} {selectedOrder.address?.lastName}</strong></p>
                <p>{selectedOrder.address?.email}</p>
                <p>{selectedOrder.address?.phone}</p>
                <p>{selectedOrder.address?.street}</p>
                <p>{selectedOrder.address?.city}, {selectedOrder.address?.zipcode}</p>
                <p>{selectedOrder.address?.country}</p>
              </div>

              <div className="detail-section">
                <h3>Products</h3>
                <div className="detail-products">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="detail-product">
                      <img 
                        src={getImageUrl(item)}
                        alt={item.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder.png';
                        }}
                      />
                      <div className="product-info">
                        <h4>{item.name}</h4>
                        <p>{item.category} • {item.subCategory}</p>
                        <p>€{item.price} x {item.quantity}</p>
                      </div>
                      <span className="product-total">
                        €{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>€{selectedOrder.subtotal?.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>€{selectedOrder.shipping?.toFixed(2)}</span>
                </div>
                <div className="total-row grand">
                  <span>Total</span>
                  <span>€{selectedOrder.amount?.toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.trackingNumber && (
                <div className="detail-section">
                  <h3>Shipping</h3>
                  <p>Tracking: <strong>{selectedOrder.trackingNumber}</strong></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;