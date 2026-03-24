// AdminLogin.jsx - Avec effet peptides/thérapie moléculaire
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import '../styles/AdminLogin.scss';
import logo from '../assets/logo.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/admin`,
        { email: email.trim(), password },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      if (response.data.success && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('adminData', JSON.stringify({
          email: response.data.email || email.trim(),
          role: response.data.role || 'admin'
        }));
        
        axios.defaults.headers.common['token'] = response.data.token;
        
        toast.success('Welcome back, Admin! 🛡️');
        navigate('/admin/dashboard');
      } else {
        toast.error(response.data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please try again.');
      } else if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;
        
        if (status === 401) {
          toast.error(message || 'Invalid credentials. Please try again.');
        } else if (status === 403) {
          toast.error('Access denied. Admin privileges required.');
        } else if (status === 500) {
          toast.error('Server error. Please contact support.');
        } else {
          toast.error(message || `Error ${status}: Login failed`);
        }
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check your connection.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* ARRIÈRE-PLAN PEPTIDES/THÉRAPIE */}
      <div className="peptide-background">
        <div className="peptides-container">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className={`molecule icon-${['dna','microscope','atom','pill','dna-strand'][i%5]} size-${['xs','sm','md','lg','xl'][i%5]} speed-${['slow','normal','fast'][i%3]}`}
            />
          ))}
        </div>
        
        {/* Helix SVG décoratifs */}
        <svg className="helix-container helix-1" viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet">
          <path className="helix-strand" d="M50,10 Q70,40 50,70 T50,130" />
          <path className="helix-strand" d="M50,10 Q30,40 50,70 T50,130" />
          {[...Array(5)].map((_, i) => (
            <line key={i} className="helix-rung" x1="35" y1={30+i*20} x2="65" y2={30+i*20} />
          ))}
        </svg>
        
        <svg className="helix-container helix-2" viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet">
          <path className="helix-strand" d="M50,10 Q70,40 50,70 T50,130" />
          <path className="helix-strand" d="M50,10 Q30,40 50,70 T50,130" />
          {[...Array(5)].map((_, i) => (
            <line key={i} className="helix-rung" x1="35" y1={30+i*20} x2="65" y2={30+i*20} />
          ))}
        </svg>
        
        {/* Particules énergétiques */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`energy-particle p-${i+1}`} />
        ))}
      </div>

      <div className="login-container">
        <div className="login-brand">
          <img src={logo} alt="Mass Labs" className="brand-logo" />
          <h1>MASS LABS</h1>
          <p>Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-header">
            <Shield size={32} className="shield-icon" />
            <h2>Secure Login</h2>
          </div>
          
          <div className="form-group">
            <label htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@masslabs.com"
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="password-input">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock size={18} />
                <span>Access Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>🔒 Secure SSL Connection</p>
          <p>© 2026 Mass Labs. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;