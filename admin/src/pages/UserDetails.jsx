import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar,
  ShoppingBag,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
  Loader2,
  MapPin,
  Camera
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/UserDetails.scss';

const UserDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active',
    address: {
      street: '',
      city: '',
      state: '',
      zipcode: '',
      country: ''
    }
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  // Fetch user details
  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/user/admin/user/${id}`,
        { headers: { token } }
      );

      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'customer',
          status: userData.status || 'active',
          address: {
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            state: userData.address?.state || '',
            zipcode: userData.address?.zipcode || '',
            country: userData.address?.country || ''
          }
        });
      } else {
        toast.error('Failed to load user details');
        navigate('/admin/users');
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      toast.error('Failed to load user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  }, [id, backendUrl, token, navigate]);

  // Fetch user orders
  const fetchUserOrders = useCallback(async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/user/admin/orders`,
        { headers: { token } }
      );

      if (response.data.success && response.data.orders) {
        const userOrders = response.data.orders.filter(
          order => order.userId === id || order.user?._id === id
        );
        setOrders(userOrders);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  }, [id, backendUrl, token]);

  useEffect(() => {
    fetchUserDetails();
    fetchUserOrders();
  }, [fetchUserDetails, fetchUserOrders]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await axios.post(
        `${backendUrl}/api/user/update-profile`,
        {
          userId: id,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
          address: formData.address
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('User updated successfully');
        setUser(response.data.user);
        setEditing(false);
      } else {
        toast.error(response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/status`,
        { userId: id, status: newStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(`User status updated to ${newStatus}`);
        setUser(prev => ({ ...prev, status: newStatus }));
        setFormData(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/api/user/delete`,
        { userId: id },
        { headers: { token } }
      );
      toast.success('User deleted successfully');
      navigate('/admin/users');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'moderator': return 'role-moderator';
      default: return 'role-customer';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'banned': return 'status-banned';
      default: return 'status-inactive';
    }
  };

  const calculateTotalSpent = () => {
    return orders.reduce((total, order) => total + (order.amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="user-details-page">
        <div className="loading-spinner">
          <Loader2 size={32} className="spinner" />
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="user-details-page">
      {/* Header */}
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/users')}>
          <ArrowLeft size={18} />
          <span>Back to Users</span>
        </button>
        
        <div className="header-actions">
          {!editing ? (
            <>
              <button 
                className="btn-secondary"
                onClick={() => setEditing(true)}
              >
                <Edit2 size={16} />
                Edit User
              </button>
              {user.status === 'active' ? (
                <button 
                  className="btn-warning"
                  onClick={() => handleStatusChange('banned')}
                >
                  <Ban size={16} />
                  Ban User
                </button>
              ) : (
                <button 
                  className="btn-success"
                  onClick={() => handleStatusChange('active')}
                >
                  <CheckCircle size={16} />
                  Activate
                </button>
              )}
              <button 
                className="btn-danger"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn-secondary"
                onClick={() => {
                  setEditing(false);
                  fetchUserDetails();
                }}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="user-details-content">
        {/* Left Column - User Info */}
        <div className="user-info-card">
          <div className="user-avatar-section">
            <div className="avatar-wrapper">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                alt={user.name} 
              />
              <button className="btn-change-avatar">
                <Camera size={16} />
              </button>
            </div>
            <h2>{user.name}</h2>
            <p className="user-email">{user.email}</p>
            <div className="user-badges">
              <span className={`badge ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
              <span className={`badge ${getStatusColor(user.status)}`}>
                {user.status}
              </span>
            </div>
          </div>

          <div className="user-stats">
            <div className="stat-item">
              <ShoppingBag size={20} />
              <div>
                <p className="stat-value">{orders.length}</p>
                <p className="stat-label">Orders</p>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-currency">$</span>
              <div>
                <p className="stat-value">{calculateTotalSpent().toFixed(2)}</p>
                <p className="stat-label">Total Spent</p>
              </div>
            </div>
          </div>

          <div className="user-meta">
            <div className="meta-item">
              <Calendar size={16} />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <Shield size={16} />
              <span>ID: {user._id}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form / Details */}
        <div className="user-edit-card">
          <h3>User Information</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>
                  <User size={16} />
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="field-value">{user.name}</p>
                )}
              </div>

              <div className="form-field">
                <label>
                  <Mail size={16} />
                  Email Address
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled
                  />
                ) : (
                  <p className="field-value">{user.email}</p>
                )}
              </div>

              <div className="form-field">
                <label>
                  <Phone size={16} />
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="field-value">{user.phone || 'Not provided'}</p>
                )}
              </div>

              <div className="form-field">
                <label>
                  <Shield size={16} />
                  User Role
                </label>
                {editing ? (
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="customer">Customer</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <p className="field-value">{user.role}</p>
                )}
              </div>
            </div>

            <h3 className="section-title">Address Information</h3>
            <div className="form-grid">
              <div className="form-field full-width">
                <label>
                  <MapPin size={16} />
                  Street Address
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                  />
                ) : (
                  <p className="field-value">{user.address?.street || 'Not provided'}</p>
                )}
              </div>

              <div className="form-field">
                <label>City</label>
                {editing ? (
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="field-value">{user.address?.city || 'Not provided'}</p>
                )}
              </div>

              <div className="form-field">
                <label>State</label>
                {editing ? (
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="field-value">{user.address?.state || 'Not provided'}</p>
                )}
              </div>

              <div className="form-field">
                <label>ZIP Code</label>
                {editing ? (
                  <input
                    type="text"
                    name="address.zipcode"
                    value={formData.address.zipcode}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="field-value">{user.address?.zipcode || 'Not provided'}</p>
                )}
              </div>

              <div className="form-field">
                <label>Country</label>
                {editing ? (
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="field-value">{user.address?.country || 'Not provided'}</p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Orders Section */}
      <div className="user-orders-section">
        <h3>Order History</h3>
        {orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={48} />
            <p>No orders found for this user</p>
          </div>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-8)}</td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td>${order.amount?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span className={`order-status status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-view"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;