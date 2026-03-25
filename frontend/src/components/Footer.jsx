import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Mail, 
  MapPin, 
  ArrowRight,
  CreditCard,
  Bitcoin,
  Building2,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';
import '../styles/Footer.css';
import { assets } from '../assets/assets';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); 
  const [message, setMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !consent) {
      setStatus('error');
      setMessage('Please provide email and accept the privacy policy');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, consent }),
      });

      const data = await response.json();

      if (response.ok) {
        // 200 or 201 - New subscription
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
        setConsent(false);
        
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else if (response.status === 409) {
        // 409 - Already subscribed (treat as info, not error)
        setStatus('info');
        setMessage(data.message || 'You are already subscribed!');
        setEmail('');
        setConsent(false);
        
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        // Other errors (400, 500, etc.)
        setStatus('error');
        setMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const legalLinks = [
    { to: '/terms', label: 'Terms of Service' },
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/shipping', label: 'Shipping Policy' },
    { to: '/refund', label: 'Refund Policy' },
  ];

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Brand Section */}
        <div className="footer__section footer__section--brand">
          <div className="footer__brand">
            <img src={assets.logo} alt="Mass Labs" className="footer__logo-img" />
            <h3 className="footer__logo-text">Mass Labs</h3>
          </div>
          <p className="footer__description">
            Premium supplier of research-grade anabolic steroids, SARMs, and performance 
            enhancement compounds. Lab-tested purity, discreet worldwide shipping, 
            and secure payment options for serious athletes and researchers.
          </p>
        </div>

        {/* Navigation */}
        <div className="footer__section">
          <h4 className="footer__title">Navigation</h4>
          <ul className="footer__links">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="footer__link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className="footer__section">
          <h4 className="footer__title">Legal</h4>
          <ul className="footer__links">
            {legalLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="footer__link footer__link--legal">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer__section footer__section--contact">
          <h4 className="footer__title">Contact Us</h4>
          <div className="footer__contact">
            <a href="mailto:contact@masslabs.shop" className="footer__contact-item">
              <Mail size={18} />
              <span>contact@masslabs.shop</span>
            </a>
            <div className="footer__contact-item">
              <MapPin size={18} />
              <span>Europe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter - Centered */}
      <div className="footer__newsletter-wrapper">
        <div className="footer__newsletter">
          <div className="footer__newsletter-header">
            <Shield size={24} className="footer__newsletter-icon" />
            <h5>Join the Inner Circle</h5>
          </div>
          <p className="footer__newsletter-text">
            Get exclusive access to new compounds, lab results, and member-only discounts.
          </p>
          
          {/* Status Messages */}
          {status === 'success' && (
            <div className="footer__alert footer__alert--success">
              <CheckCircle size={18} />
              <span>{message}</span>
            </div>
          )}
          {status === 'info' && (
            <div className="footer__alert footer__alert--info">
              <Info size={18} />
              <span>{message}</span>
            </div>
          )}
          {status === 'error' && (
            <div className="footer__alert footer__alert--error">
              <AlertCircle size={18} />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleNewsletterSubmit} className="footer__form">
            <div className="footer__input-group">
              <Mail size={16} className="footer__input-icon" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                required
              />
            </div>
            <label className="footer__checkbox">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={status === 'loading'}
                required
              />
              <span>I accept the privacy policy & confirm I am 18+</span>
            </label>
            <button 
              type="submit" 
              className="footer__btn"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <>
                  <span>Subscribe</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-content">
          <p className="footer__copyright">
            © {currentYear} <strong>Mass Labs</strong>. All rights reserved.
          </p>
          
          <div className="footer__payments">
            <CreditCard size={20} />
            <Bitcoin size={20} />
            <Building2 size={20} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;