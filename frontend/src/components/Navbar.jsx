import React, { useState, useContext, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';
import { 
  FiShoppingCart, 
  FiUser, 
  FiFileText, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiPackage
} from 'react-icons/fi';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  
  const { 
    getCartCount, 
    token, 
    setToken, 
    cartItems,
    setCartItems 
  } = useContext(ShopContext);
  
  const navigate = useNavigate();
  const cartCount = getCartCount();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
    setUserMenuOpen(false);
    
    toast?.success?.('Successfully disconnected') || alert('Logout');
    navigate('/');
  };

  const isLoggedIn = !!token;

  return (
    <>
      <nav className="navbar">
        <div className="navbar__container">
          {/* LOGO */}
          <NavLink to="/" className="navbar__logo" onClick={closeMenu}>
            <img src={assets.logo} alt="Logo" className="navbar__logo-img" />
          </NavLink>

          {/* CENTER MENU - Desktop */}
          <div className="navbar__center-menu">
            <NavLink to="/" className="navbar__link" onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/shop" className="navbar__link" onClick={closeMenu}>
              Shop
            </NavLink>
            <NavLink to="/about" className="navbar__link" onClick={closeMenu}>
              About
            </NavLink>
            <NavLink to="/contact" className="navbar__link" onClick={closeMenu}>
              Contact
            </NavLink>
          </div>

          {/* RIGHT SECTION */}
          <div className="navbar__right-section">
            <div className="navbar__icons">
              
              {/* CART */}
              <NavLink 
                to="/cart" 
                className="navbar__icon-btn" 
                onClick={closeMenu}
                aria-label="Cart"
              >
                <FiShoppingCart className="navbar__icon" />
                {cartCount > 0 && (
                  <span className="navbar__cart-badge">{cartCount}</span>
                )}
              </NavLink>

              {/* USER MENU - Desktop */}
              <div className="navbar__user-menu-container" ref={userMenuRef}>
                {isLoggedIn ? (
                  <>
                    <button 
                      className={`navbar__icon-btn ${userMenuOpen ? 'active' : ''}`}
                      onClick={toggleUserMenu}
                      aria-label="User menu"
                    >
                      <FiUser className="navbar__icon" />
                    </button>
                    
                    {/* DROPDOWN MENU */}
                    <div className={`navbar__dropdown ${userMenuOpen ? 'open' : ''}`}>
                      <div className="navbar__dropdown-header">
                        <span className="navbar__dropdown-title">My Account</span>
                      </div>
                      
                      <NavLink 
                        to="/profile" 
                        className="navbar__dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiUser className="navbar__dropdown-icon" />
                        <span>Profile</span>
                      </NavLink>
                      
                      <NavLink 
                        to="/orders" 
                        className="navbar__dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiPackage className="navbar__dropdown-icon" />
                        <span>Orders</span>
                      </NavLink>
                      
                      <div className="navbar__dropdown-divider"></div>
                      
                      <button 
                        className="navbar__dropdown-item navbar__dropdown-item--danger"
                        onClick={handleLogout}
                      >
                        <FiLogOut className="navbar__dropdown-icon" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <NavLink 
                    to="/login" 
                    className="navbar__icon-btn"
                    aria-label="Login"
                  >
                    <FiUser className="navbar__icon" />
                  </NavLink>
                )}
              </div>
            </div>

            {/* BURGER - Mobile */}
            <button 
              className="navbar__toggle" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX className="navbar__toggle-icon" /> : <FiMenu className="navbar__toggle-icon" />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`navbar__mobile-menu ${menuOpen ? 'open' : ''}`}>
        <button className="navbar__mobile-close" onClick={closeMenu} aria-label="Close menu">
          <FiX />
        </button>
        
        <div className="navbar__mobile-content">
          <NavLink to="/" onClick={closeMenu} className="navbar__mobile-link">Home</NavLink>
          <NavLink to="/shop" onClick={closeMenu} className="navbar__mobile-link">Shop</NavLink>
          <NavLink to="/about" onClick={closeMenu} className="navbar__mobile-link">About</NavLink>
          <NavLink to="/contact" onClick={closeMenu} className="navbar__mobile-link">Contact</NavLink>
          
          <div className="navbar__mobile-divider"></div>
          
          <NavLink to="/cart" onClick={closeMenu} className="navbar__mobile-cart">
            <FiShoppingCart className="navbar__mobile-icon" />
            <span>Cart</span>
            {cartCount > 0 && <span className="navbar__mobile-badge">{cartCount}</span>}
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink to="/profile" onClick={closeMenu} className="navbar__mobile-link">
                <FiUser className="navbar__mobile-icon" /> Profile
              </NavLink>
              <NavLink to="/orders" onClick={closeMenu} className="navbar__mobile-link">
                <FiPackage className="navbar__mobile-icon" /> Orders
              </NavLink>
              <button 
                className="navbar__mobile-logout"
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
              >
                <FiLogOut className="navbar__mobile-icon" /> Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" onClick={closeMenu} className="navbar__mobile-link">
              <FiUser className="navbar__mobile-icon" /> Login
            </NavLink>
          )}
        </div>
      </div>

      {menuOpen && <div className="navbar__overlay" onClick={closeMenu} />}
    </>
  );
};

export default Navbar;