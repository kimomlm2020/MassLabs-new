// components/AdminNavbar.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminNavbar.scss';
import { 
  Search, 
  Bell, 
  Plus,
  ChevronDown,
  X,
  User,
  LogOut
} from 'lucide-react';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // User state from localStorage or defaults
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : {
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Super Admin',
      avatar: null
    };
  });

  // Notifications state from localStorage or defaults
  const [notifications, setNotifications] = useState(() => {
    const savedNotifs = localStorage.getItem('notifications');
    return savedNotifs ? JSON.parse(savedNotifs) : [
      { id: 1, text: 'New order #1234', time: '2 min ago', unread: true, read: false },
      { id: 2, text: 'User registration', time: '1 hour ago', unread: true, read: false },
      { id: 3, text: 'Product low stock', time: '3 hours ago', unread: false, read: true },
    ];
  });

  // Persist notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Mark single notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, unread: false, read: true } : notif
    ));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ 
      ...notif, 
      unread: false, 
      read: true 
    })));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setNotifOpen(false);
  }, []);

  // Handle notification click
  const handleNotificationClick = useCallback((notif) => {
    markAsRead(notif.id);
    
    if (notif.text.includes('order')) {
      navigate('/admin/orders');
    } else if (notif.text.includes('User')) {
      navigate('/admin/users');
    } else if (notif.text.includes('stock')) {
      navigate('/admin/products');
    }
    
    setNotifOpen(false);
  }, [markAsRead, navigate]);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // CORRECTED: Logout with proper redirect to admin login
  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    // Call logout API if token exists
    if (token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/logout`, {
          method: 'POST',
          headers: {
            'token': token,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.log('Logout API call failed, continuing with local logout');
      }
    }

    // Clear all local storage items
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('notifications');
    
    // Reset states
    setProfileOpen(false);
    setNotifications([]);
    
    // CORRECTED: Redirect to admin login page (not /login)
    // Essayez ces routes selon votre configuration:
    
    // Option 1: Route admin login standard
    navigate('/admin/login', { replace: true });
    
    // Option 2: Si vous avez une route différente, décommentez celle qui fonctionne:
    // navigate('/admin', { replace: true });
    // navigate('/login/admin', { replace: true });
    // navigate('/auth/admin', { replace: true });
    
    // Option 3: Force reload si nécessaire (décommentez si navigate ne fonctionne pas)
    // window.location.href = '/admin/login';
  }, [navigate]);

  return (
    <header className="admin-navbar">
      <div className="navbar-left">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search products, orders..."
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleSearchSubmit}
            aria-label="Search"
          />
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="navbar-right">
        {/* Notifications */}
        <div className="notif-wrapper" ref={notifRef}>
          <button 
            className="icon-btn notif-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>
          
          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h4>Notifications</h4>
                <div className="notif-actions">
                  {unreadCount > 0 && (
                    <button 
                      className="mark-all-read" 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>
              
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <Bell size={32} />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notif-item ${notif.unread ? 'unread' : ''} ${notif.read ? 'read' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notif-content">
                        <p className="notif-text">{notif.text}</p>
                        <span className="notif-time">{notif.time}</span>
                      </div>
                      {notif.unread && <span className="unread-dot" />}
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="notif-footer">
                  <button 
                    className="clear-notifs" 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotifications();
                    }}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Action */}
        <button 
          className="btn-primary"
          onClick={() => navigate('/admin/products/add')}
          aria-label="Add new product"
        >
          <Plus size={18} />
          <span>New Product</span>
        </button>

        {/* Profile Menu */}
        <div className="profile-menu" ref={profileRef}>
          <div 
            className="avatar-wrapper" 
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="avatar-container">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="avatar-placeholder" style={{ display: user.avatar ? 'none' : 'flex' }}>
                <User size={20} />
              </div>
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <ChevronDown size={16} className={profileOpen ? 'rotated' : ''} />
          </div>

          {profileOpen && (
            <div className="profile-dropdown">
              {/* User Info */}
              <div className="dropdown-section user-section">
                <div className="user-details">
                  <div className="avatar-large">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="avatar-fallback" style={{ display: user.avatar ? 'none' : 'flex' }}>
                      <User size={32} />
                    </div>
                  </div>
                  <div className="user-text">
                    <p className="user-name-large">{user.name}</p>
                    <p className="user-email">{user.email}</p>
                    <span className="user-role-badge">{user.role}</span>
                  </div>
                </div>
              </div>

              <div className="dropdown-divider" />

              {/* Logout */}
              <div className="dropdown-section">
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;