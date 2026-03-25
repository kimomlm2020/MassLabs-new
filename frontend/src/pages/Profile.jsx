import React, { useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
  const { token, user, setUser, logout, navigate, api, backendUrl } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: { street: '', city: '', zipcode: '', country: 'France' }
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Helper for API calls
  const makeRequest = useCallback(async (method, endpoint, data = null, config = {}) => {
    if (api && typeof api[method] === 'function') {
      return api[method](endpoint, data, config);
    }
    
    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      throw new Error('Not authenticated');
    }

    const defaultConfig = {
      headers: { 
        token: authToken,
        ...config.headers 
      },
      ...config
    };
    
    const url = `${backendUrl}${endpoint}`;
    
    if (method === 'get') {
      return axios.get(url, defaultConfig);
    } else if (method === 'post') {
      return axios.post(url, data, defaultConfig);
    } else if (method === 'put') {
      return axios.put(url, data, defaultConfig);
    } else if (method === 'delete') {
      return axios.delete(url, defaultConfig);
    }
    
    throw new Error(`Method ${method} not supported`);
  }, [api, token, backendUrl]);

  // Authentication check
  useEffect(() => {
    if (!token && !localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Load profile from server - OPTIMIZED
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await makeRequest('get', '/api/user/profile');
      if (data.success && data.user) {
        // Merge with existing user data to preserve any missing fields
        const mergedUser = {
          ...user, // Keep existing data as fallback
          ...data.user, // Override with fresh data from server
          address: {
            ...user?.address,
            ...data.user?.address
          }
        };
        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify(mergedUser));
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired');
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [token, makeRequest, setUser, logout, navigate, user]);

  // Load orders
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      setOrdersLoading(true);
      const { data } = await makeRequest('post', '/api/order/userorders', {});
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [token, makeRequest]);

  // Load data on mount - ONLY ONCE
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchOrders();
    }
  }, []); // Empty dependency array - only run once on mount

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          zipcode: user.address?.zipcode || '',
          country: user.address?.country || 'France'
        }
      });
    }
  }, [user]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Avatar handling
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Unsupported format. Use JPG, PNG or WebP');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must not exceed 5MB');
      e.target.value = '';
      return;
    }

    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  // UPLOAD AVATAR - OPTIMIZED
  const uploadAvatar = async () => {
    if (!avatarFile) return;

    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      toast.error('You must be logged in');
      navigate('/login');
      return;
    }

    try {
      setUploadingAvatar(true);
      
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', avatarFile);

      const response = await axios.post(
        `${backendUrl}/api/user/upload-avatar`, 
        formDataUpload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'token': authToken
          },
          timeout: 30000
        }
      );

      if (response.data.success) {
        let updatedUserData = null;
        
        if (response.data.user) {
          updatedUserData = response.data.user;
        } else if (response.data.avatarUrl) {
          updatedUserData = { 
            ...user, 
            avatar: response.data.avatarUrl 
          };
        }

        if (updatedUserData) {
          setUser(updatedUserData);
          localStorage.setItem('user', JSON.stringify(updatedUserData));
          toast.success('Profile picture updated successfully');
        }

        cancelAvatarChange();
        
      } else {
        toast.error(response.data.message || 'Error updating profile picture');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Error uploading image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const cancelAvatarChange = () => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form input handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Update profile - OPTIMIZED
  const updateProfile = async (e) => {
    e.preventDefault();
    if (formData.name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    try {
      setLoading(true);
      const { data } = await makeRequest('post', '/api/user/update-profile', formData);
      if (data.success && data.user) {
        // Merge with existing user data
        const mergedUser = {
          ...user,
          ...data.user,
          address: {
            ...user?.address,
            ...data.user?.address
          }
        };
        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify(mergedUser));
        setEditMode(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.message || 'Error updating profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || 'Update error');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      const { data } = await makeRequest('post', '/api/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (data.success) {
        toast.success('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Error changing password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      toast.error(err.response?.data?.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  // Default avatar URL
  const getAvatarUrl = useCallback((userData) => {
    if (userData?.avatar) {
      if (userData.avatar.startsWith('http')) {
        return userData.avatar;
      }
      return `${backendUrl}${userData.avatar.startsWith('/') ? '' : '/'}${userData.avatar}`;
    }
    const seed = userData?.name || 'user';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }, [backendUrl]);

  // Avatar to display
  const displayAvatar = useMemo(() => {
    if (avatarPreview) {
      return avatarPreview;
    }
    if (user?.avatar) {
      return getAvatarUrl(user);
    }
    return getAvatarUrl({ name: user?.name });
  }, [avatarPreview, user, getAvatarUrl]);

  // Image error handler
  const handleImageError = useCallback((e) => {
    if (!e.target.src.includes('dicebear')) {
      e.target.src = getAvatarUrl({ name: user?.name });
    }
  }, [getAvatarUrl, user?.name]);

  // Format address for display
  const formatAddress = useCallback((address) => {
    if (!address) return '-';
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.zipcode) parts.push(address.zipcode);
    if (address.country) parts.push(address.country);
    return parts.length > 0 ? parts.join(', ') : '-';
  }, []);

  if (!token) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Redirecting to login...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              <img 
                key={displayAvatar}
                src={displayAvatar} 
                alt="Avatar" 
                className={avatarPreview ? 'preview-mode' : ''}
                onError={handleImageError}
              />
              
              <div 
                className="avatar-overlay" 
                onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
              >
                <span className="camera-icon">📷</span>
                <span className="overlay-text">
                  {uploadingAvatar ? '...' : 'Change'}
                </span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                style={{ display: 'none' }}
                disabled={uploadingAvatar}
              />
            </div>

            {avatarFile && (
              <div className="avatar-actions">
                <button 
                  className="btn-avatar-save" 
                  onClick={uploadAvatar}
                  disabled={uploadingAvatar}
                  title="Save"
                >
                  {uploadingAvatar ? '...' : '✓'}
                </button>
                <button 
                  className="btn-avatar-cancel" 
                  onClick={cancelAvatarChange}
                  disabled={uploadingAvatar}
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <h2>{user?.name || 'User'}</h2>
          <p className="user-email">{user?.email}</p>
          <p className="member-since">
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A'}
          </p>
          
          <nav className="profile-menu">
            <button 
              className={activeTab === 'profile' ? 'active' : ''} 
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            <button 
              className={activeTab === 'orders' ? 'active' : ''} 
              onClick={() => setActiveTab('orders')}
            >
              📦 Orders {orders.length > 0 && <span className="badge">{orders.length}</span>}
            </button>
            <button 
              className={activeTab === 'settings' ? 'active' : ''} 
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Security
            </button>
            <button className="logout-btn" onClick={logout}>🚪 Logout</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
          {(loading || ordersLoading) && (
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <section className="profile-section">
              <div className="section-header">
                <h3>Personal Information</h3>
                {!editMode && <button className="btn-gold" onClick={() => setEditMode(true)}>Edit</button>}
              </div>

              {editMode ? (
                <form onSubmit={updateProfile} className="profile-form">
                  <div className="form-group required">
                    <label>Full Name</label>
                    <input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                      minLength={2}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      disabled 
                      className="disabled" 
                    />
                    <small className="help-text">Email cannot be changed</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="+33 6 12 34 56 78" 
                    />
                  </div>

                  <div className="address-section">
                    <h4>Shipping Address</h4>
                    <div className="form-group">
                      <label>Street</label>
                      <input 
                        name="address.street" 
                        value={formData.address.street} 
                        onChange={handleInputChange} 
                        placeholder="123 Example Street"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input 
                          name="address.city" 
                          value={formData.address.city} 
                          onChange={handleInputChange} 
                          placeholder="Paris"
                        />
                      </div>
                      <div className="form-group">
                        <label>Zip Code</label>
                        <input 
                          name="address.zipcode" 
                          value={formData.address.zipcode} 
                          onChange={handleInputChange} 
                          placeholder="75001"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input 
                        name="address.country" 
                        value={formData.address.country} 
                        onChange={handleInputChange} 
                        placeholder="France"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-dark" onClick={() => setEditMode(false)}>Cancel</button>
                    <button type="submit" className="btn-gold" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="info-display">
                  <div className="info-row">
                    <span>Full Name</span>
                    <p>{user?.name || '-'}</p>
                  </div>
                  <div className="info-row">
                    <span>Email</span>
                    <p>{user?.email || '-'}</p>
                  </div>
                  <div className="info-row">
                    <span>Phone</span>
                    <p>{user?.phone || '-'}</p>
                  </div>
                  <div className="info-row">
                    <span>Address</span>
                    <p>{formatAddress(user?.address)}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <section className="profile-section">
              <div className="section-header">
                <h3>My Orders</h3>
                <span className="order-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
              </div>
              
              {orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <p>You haven't placed any orders yet</p>
                  <button className="btn-gold" onClick={() => navigate('/programs')}>
                    Browse Programs
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <div>
                          <span className="order-id">#{order._id?.slice(-8).toUpperCase()}</span>
                          <span className="order-date">
                            {order.date ? new Date(order.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'Unknown date'}
                          </span>
                        </div>
                        <span className={`order-status ${order.status || 'pending'}`}>
                          {order.status === 'paid' ? 'Paid' : order.status || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="order-items">
                        {(order.items || []).map((item, idx) => (
                          <div key={`${order._id}-${idx}`} className="order-item">
                            <span className="item-icon">{item.icon || '📋'}</span>
                            <div className="item-details">
                              <p className="item-name">{item.name || 'Product'}</p>
                              <p className="item-meta">
                                {item.level || 'Standard'} • {item.duration || ''}
                              </p>
                            </div>
                            <span className="item-price">
                              {item.price ? `${item.price}€` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-footer">
                        <span className={`payment-status ${order.payment ? 'paid' : 'pending'}`}>
                          {order.payment ? '✓ Paid' : '⏳ Pending'}
                        </span>
                        <span className="order-total">
                          Total: <strong>{order.amount ? `${order.amount}€` : '-'}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Security Tab */}
          {activeTab === 'settings' && (
            <section className="profile-section">
              <h3>Change Password</h3>
              <form onSubmit={changePassword} className="profile-form">
                <div className="form-group required">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData(p => ({...p, currentPassword: e.target.value}))}
                    required 
                  />
                </div>
                <div className="form-group required">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData(p => ({...p, newPassword: e.target.value}))}
                    required 
                    minLength={8}
                  />
                  <small className="help-text">Minimum 8 characters</small>
                </div>
                <div className="form-group required">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData(p => ({...p, confirmPassword: e.target.value}))}
                    required 
                  />
                </div>
                <button type="submit" className="btn-gold" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </section>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;