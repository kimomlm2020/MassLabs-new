import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import '../styles/AdminSidebar.scss';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  TrendingUp,
  Image,
  ChevronRight,
  Menu
} from 'lucide-react';
import logo from '../assets/logo.png';

const AdminSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { 
      path: '/admin/products', 
      icon: Package, 
      label: 'Products', 
      subItems: [
        { path: '/admin/products', label: 'All Products' },
        { path: '/admin/products/add', label: 'Add Product' }
      ]
    },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.href = '/admin/login';
  };

  const isSubMenuActive = (subItems) => {
    return subItems?.some(sub => location.pathname === sub.path);
  };

  return (
    <>
      {/* Overlay mobile */}
      {isMobile && isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      {isMobile && !isOpen && (
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} />
        </button>
      )}

      <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img src={logo} alt="Logo" className="logo-icon" />
            <span className="logo-text">MassLabs Admin</span>
          </div>
          
          {!isMobile && (
            <button 
              className="toggle-btn"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronLeft size={20} className={!isOpen ? 'rotated' : ''} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <div key={`${item.path}-${index}`} className="nav-item-wrapper">
              <NavLink
                to={item.path}
                end={!item.subItems}
                className={({ isActive }) => 
                  `nav-item ${isActive || isSubMenuActive(item.subItems) ? 'active' : ''}`
                }
                onClick={() => isMobile && setIsOpen(false)}
              >
                <item.icon size={20} />
                <span className="nav-label">{item.label}</span>
                {item.subItems && isOpen && (
                  <ChevronRight 
                    size={16} 
                    className={`sub-indicator ${isSubMenuActive(item.subItems) ? 'active' : ''}`} 
                  />
                )}
              </NavLink>
              
              {item.subItems && isOpen && (
                <div className={`sub-nav ${isSubMenuActive(item.subItems) ? 'expanded' : ''}`}>
                  {item.subItems.map((sub, subIndex) => (
                    <NavLink
                      key={`${sub.path}-${subIndex}`}
                      to={sub.path}
                      end
                      className={({ isActive }) => 
                        `sub-nav-item ${isActive ? 'active' : ''}`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          
          <div className="admin-info">
            <div className="admin-avatar">👤</div>
            <div className="admin-details">
              <span className="admin-name">Admin</span>
              <span className="admin-role">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;