// src/pages/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios'; // ✅ Import standard d'axios
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Login.scss';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const { token, setToken, navigate, backendUrl, setUser, api } = useContext(ShopContext);

  // Form states
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  // Load saved email if "remember me" was checked
  useEffect(() => {
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // Save email if "remember me" is checked
  useEffect(() => {
    if (rememberMe && email) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  }, [rememberMe, email]);

  // Validation
  const validate = () => {
    if (!email) {
      toast.error('Email is required');
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      toast.error('Invalid email address');
      return false;
    }
    if (!password) {
      toast.error('Password is required');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (mode === 'signup' && !name.trim()) {
      toast.error('Name is required');
      return false;
    }
    return true;
  };

  // Main submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!backendUrl) {
      toast.error('Backend URL is not configured');
      return;
    }

    setIsLoading(true);
    const endpoint = mode === 'login' ? '/api/user/login' : '/api/user/register';
    const payload = mode === 'login'
      ? { email: email.toLowerCase(), password }
      : { name: name.trim(), email: email.toLowerCase(), password };

    try {
      // ✅ Utilise api du context si disponible, sinon axios importé
      const request = api || axios;
      const response = await request.post(`${backendUrl}${endpoint}`, payload);

      if (response.data.success) {
        const { token: newToken, user } = response.data;
        setToken(newToken);
        localStorage.setItem('token', newToken);
        if (user) {
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        }
        toast.success(mode === 'login' ? 'Login successful' : 'Account created successfully');
        navigate('/');
      } else {
        toast.error(response.data.message || 'An error occurred');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'ERR_NETWORK') {
        toast.error('Cannot reach server. Please check your connection.');
      } else {
        toast.error(err.response?.data?.message || err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password handler
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!resetEmail || !EMAIL_REGEX.test(resetEmail)) {
      toast.error('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      // ✅ Utilise api du context si disponible, sinon axios importé
      const request = api || axios;
      const response = await request.post(`${backendUrl}/api/user/forgot-password`, {
        email: resetEmail.toLowerCase()
      });
      if (response.data.success) {
        toast.success('Password reset link sent to your email');
        setShowForgot(false);
        setResetEmail('');
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between login/signup
  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  return (
    <div className="login-page">
      <Navbar menuOpen={false} setMenuOpen={() => {}} />

      {/* Forgot Password Screen */}
      {showForgot ? (
        <div className="login-container">
          <form onSubmit={handleForgot} className="login-form">
            <h1 className="form-title">Reset Password</h1>
            <p className="form-subtitle">Enter your email to receive a reset link</p>
            <div className="form-group">
              <input
                type="email"
                placeholder="Your email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-gold" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                className="btn-text"
                onClick={() => { setShowForgot(false); setResetEmail(''); }}
                disabled={isLoading}
              >
                ← Back to Login
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Main Login/Signup Form */
        <div className="login-container">
          <form onSubmit={handleSubmit} className="login-form">
            <h1 className="form-title">{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>

            {mode === 'signup' && (
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group password-group">
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="btn-text"
                  onClick={() => setShowForgot(true)}
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-gold btn-large" disabled={isLoading}>
                {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </div>

            <div className="form-switch">
              <span>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </span>
              <button type="button" className="btn-text btn-gold-text" onClick={toggleMode} disabled={isLoading}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Login;