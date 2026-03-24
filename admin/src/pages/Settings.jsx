import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Save,
  RefreshCw,
  Image,
  Mail,
  CreditCard,
  Truck,
  Shield,
  Bell,
  Globe,
  Palette,
  FileText,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCog
} from 'lucide-react';
import '../styles/Settings.scss';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  const fileInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  // DEFAULTS - Must match backend defaults exactly
  const defaultSettings = {
    storeName: 'Mass Labs',
    storeEmail: 'contact@masslabs.com',
    storePhone: '+33 1 23 45 67 89',
    storeDescription: 'Premium anabolic products for serious athletes',
    currency: 'GBP',
    timezone: 'Europe/London',
    language: 'en',
    primaryColor: '#D4AF37',
    secondaryColor: '#635BFF',
    darkMode: true,
    logo: null,
    favicon: null,
    shippingCost: 30,
    freeShippingThreshold: 200,
    shippingFrom: 'UK',
    estimatedDeliveryDays: '5-10',
    stripeEnabled: true,
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalEnabled: false,
    paypalClientId: '',
    cryptoEnabled: false,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    senderEmail: 'noreply@masslabs.com',
    senderName: 'Mass Labs',
    twoFactorEnabled: false,
    maxLoginAttempts: 5,
    sessionTimeout: 60,
    requireEmailVerification: true,
    metaTitle: 'Mass Labs - Premium Anabolic Products',
    metaDescription: 'High quality injectables, orals, SARMs and more',
    googleAnalyticsId: '',
    facebookPixelId: '',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    refundPolicy: '30-day refund policy for unopened products',
    orderNotifications: true,
    lowStockAlert: true,
    lowStockThreshold: 10,
    newUserNotifications: false,
    dailyReports: true
  };

  const [settings, setSettings] = useState(defaultSettings);

  // FETCH SETTINGS - with proper error handling
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      console.log('[Settings] Fetching from API...');
      const response = await axios.get(`${backendUrl}/api/admin/settings`, {
        headers: { token }
      });

      if (response.data.success && response.data.settings) {
        // Merge API data with defaults (prevents undefined values)
        const mergedSettings = {
          ...defaultSettings,
          ...response.data.settings
        };

        setSettings(mergedSettings);

        // Handle image previews
        if (response.data.settings.logo) {
          setLogoPreview(response.data.settings.logo.startsWith('http') 
            ? response.data.settings.logo 
            : `${backendUrl}${response.data.settings.logo}`
          );
        }
        if (response.data.settings.favicon) {
          setFaviconPreview(response.data.settings.favicon.startsWith('http')
            ? response.data.settings.favicon
            : `${backendUrl}${response.data.settings.favicon}`
          );
        }

        console.log('[Settings] Loaded:', mergedSettings.storeName);
      }
    } catch (error) {
      console.error('[Settings] Fetch error:', error);
      toast.error('Failed to load settings - using defaults');
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  // Load on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // HANDLE SAVE - with immediate state update
  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('[Settings] Saving...', settings.storeName);
      const response = await axios.post(
        `${backendUrl}/api/admin/settings`,
        settings,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Settings saved successfully!');

        // Update state with server response (ensures sync)
        if (response.data.settings) {
          setSettings(prev => ({
            ...prev,
            ...response.data.settings
          }));
        }

        // Refresh to ensure consistency
        await fetchSettings();
      }
    } catch (error) {
      console.error('[Settings] Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // HANDLE INPUT CHANGE - centralized handler
  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // HANDLE IMAGE UPLOAD
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === 'logo') setLogoPreview(event.target.result);
      else setFaviconPreview(event.target.result);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${backendUrl}/api/admin/upload`,
        formData,
        { headers: { token, 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        handleChange(type, response.data.url);
        toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded!`);
      }
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  // TEST CONNECTIONS
  const testEmail = async () => {
    try {
      await axios.post(
        `${backendUrl}/api/admin/test-email`,
        { smtp: settings },
        { headers: { token } }
      );
      toast.success('Email connection OK');
    } catch (error) {
      toast.error('Email connection failed');
    }
  };

  const testStripe = async () => {
    try {
      await axios.post(
        `${backendUrl}/api/admin/test-stripe`,
        { key: settings.stripeSecretKey },
        { headers: { token } }
      );
      toast.success('Stripe connection OK');
    } catch (error) {
      toast.error('Stripe connection failed');
    }
  };

  // TABS CONFIGURATION
  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'seo', label: 'SEO & Marketing', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const currencies = ['GBP', 'USD', 'EUR', 'CAD', 'AUD'];
  const timezones = ['Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney'];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' }
  ];

  // RENDER TAB CONTENT
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-section">
            <h3>Store Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Store Name *</label>
                <input
                  type="text"
                  value={settings.storeName || ''}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Store Email *</label>
                <input
                  type="email"
                  value={settings.storeEmail || ''}
                  onChange={(e) => handleChange('storeEmail', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Store Phone</label>
                <input
                  type="tel"
                  value={settings.storePhone || ''}
                  onChange={(e) => handleChange('storePhone', e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label>Store Description</label>
                <textarea
                  rows={3}
                  value={settings.storeDescription || ''}
                  onChange={(e) => handleChange('storeDescription', e.target.value)}
                />
              </div>
            </div>

            <h3>Regional Settings</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Currency</label>
                <select
                  value={settings.currency || 'GBP'}
                  onChange={(e) => handleChange('currency', e.target.value)}
                >
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select
                  value={settings.timezone || 'Europe/London'}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  {timezones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Language</label>
                <select
                  value={settings.language || 'en'}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-section">
            <h3>Branding</h3>
            <div className="image-uploads">
              <div className="upload-box">
                <label>Store Logo</label>
                <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" />
                  ) : (
                    <>
                      <Image size={40} />
                      <span>Click to upload logo</span>
                      <small>400x100px, PNG/SVG</small>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'logo')} accept="image/*" hidden />
              </div>
              <div className="upload-box">
                <label>Favicon</label>
                <div className="upload-area small" onClick={() => faviconInputRef.current?.click()}>
                  {faviconPreview ? (
                    <img src={faviconPreview} alt="Favicon" />
                  ) : (
                    <>
                      <Image size={30} />
                      <span>Upload favicon</span>
                      <small>32x32px ICO/PNG</small>
                    </>
                  )}
                </div>
                <input type="file" ref={faviconInputRef} onChange={(e) => handleImageUpload(e, 'favicon')} accept="image/*" hidden />
              </div>
            </div>

            <h3>Theme Colors</h3>
            <div className="color-picker-grid">
              <div className="color-picker">
                <label>Primary Color</label>
                <div className="color-input">
                  <input
                    type="color"
                    value={settings.primaryColor || '#D4AF37'}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                  />
                  <span>{settings.primaryColor || '#D4AF37'}</span>
                </div>
              </div>
              <div className="color-picker">
                <label>Secondary Color</label>
                <div className="color-input">
                  <input
                    type="color"
                    value={settings.secondaryColor || '#635BFF'}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  />
                  <span>{settings.secondaryColor || '#635BFF'}</span>
                </div>
              </div>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.darkMode || false}
                  onChange={(e) => handleChange('darkMode', e.target.checked)}
                />
                Enable Dark Mode by Default
              </label>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="settings-section">
            <h3>Payment Methods</h3>

            <div className="payment-method">
              <div className="method-header">
                <div className="method-info">
                  <CreditCard size={24} />
                  <div>
                    <h4>Stripe</h4>
                    <p>Credit/Debit card payments</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.stripeEnabled || false}
                    onChange={(e) => handleChange('stripeEnabled', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              {settings.stripeEnabled && (
                <div className="method-config">
                  <div className="form-group">
                    <label>Public Key</label>
                    <input
                      type="text"
                      value={settings.stripePublicKey || ''}
                      onChange={(e) => handleChange('stripePublicKey', e.target.value)}
                      placeholder="pk_live_..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Secret Key</label>
                    <input
                      type="password"
                      value={settings.stripeSecretKey || ''}
                      onChange={(e) => handleChange('stripeSecretKey', e.target.value)}
                      placeholder="sk_live_..."
                    />
                  </div>
                  <button className="btn-test" onClick={testStripe}>Test Stripe</button>
                </div>
              )}
            </div>

            <div className="payment-method">
              <div className="method-header">
                <div className="method-info">
                  <span className="paypal-icon">P</span>
                  <div>
                    <h4>PayPal</h4>
                    <p>PayPal checkout</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.paypalEnabled || false}
                    onChange={(e) => handleChange('paypalEnabled', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              {settings.paypalEnabled && (
                <div className="method-config">
                  <div className="form-group">
                    <label>Client ID</label>
                    <input
                      type="text"
                      value={settings.paypalClientId || ''}
                      onChange={(e) => handleChange('paypalClientId', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="payment-method">
              <div className="method-header">
                <div className="method-info">
                  <span className="crypto-icon">₿</span>
                  <div>
                    <h4>Cryptocurrency</h4>
                    <p>Bitcoin, Ethereum, USDT</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.cryptoEnabled || false}
                    onChange={(e) => handleChange('cryptoEnabled', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="settings-section">
            <h3>Shipping Configuration</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Shipping Cost (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.shippingCost || 0}
                  onChange={(e) => handleChange('shippingCost', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Free Shipping Threshold (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.freeShippingThreshold || 0}
                  onChange={(e) => handleChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                />
                <small>Orders above this get free shipping</small>
              </div>
              <div className="form-group">
                <label>Shipping From</label>
                <select
                  value={settings.shippingFrom || 'UK'}
                  onChange={(e) => handleChange('shippingFrom', e.target.value)}
                >
                  <option value="UK">United Kingdom</option>
                  <option value="EU">European Union</option>
                  <option value="US">United States</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estimated Delivery</label>
                <input
                  type="text"
                  value={settings.estimatedDeliveryDays || ''}
                  onChange={(e) => handleChange('estimatedDeliveryDays', e.target.value)}
                  placeholder="5-10 business days"
                />
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="settings-section">
            <h3>SMTP Configuration</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtpHost || ''}
                  onChange={(e) => handleChange('smtpHost', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="form-group">
                <label>SMTP Port</label>
                <input
                  type="number"
                  value={settings.smtpPort || 587}
                  onChange={(e) => handleChange('smtpPort', parseInt(e.target.value) || 587)}
                />
              </div>
              <div className="form-group">
                <label>SMTP Username</label>
                <input
                  type="text"
                  value={settings.smtpUser || ''}
                  onChange={(e) => handleChange('smtpUser', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>SMTP Password</label>
                <input
                  type="password"
                  value={settings.smtpPass || ''}
                  onChange={(e) => handleChange('smtpPass', e.target.value)}
                />
              </div>
            </div>

            <h3>Sender Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Sender Name</label>
                <input
                  type="text"
                  value={settings.senderName || ''}
                  onChange={(e) => handleChange('senderName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Sender Email</label>
                <input
                  type="email"
                  value={settings.senderEmail || ''}
                  onChange={(e) => handleChange('senderEmail', e.target.value)}
                />
              </div>
            </div>

            <button className="btn-test email" onClick={testEmail}>
              <Mail size={18} /> Test Email
            </button>
          </div>
        );

      case 'security':
        return (
          <div className="settings-section">
            <h3>Authentication</h3>
            <div className="security-option">
              <div className="option-info">
                <Shield size={24} />
                <div>
                  <h4>Two-Factor Authentication</h4>
                  <p>Require 2FA for admin login</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.twoFactorEnabled || false}
                  onChange={(e) => handleChange('twoFactorEnabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="security-option">
              <div className="option-info">
                <Mail size={24} />
                <div>
                  <h4>Email Verification</h4>
                  <p>Require email verification for new accounts</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification || false}
                  onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <h3>Session Security</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.maxLoginAttempts || 5}
                  onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value) || 5)}
                />
              </div>
              <div className="form-group">
                <label>Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout || 60}
                  onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value) || 60)}
                />
              </div>
            </div>
          </div>
        );

      case 'seo':
        return (
          <div className="settings-section">
            <h3>Search Engine Optimization</h3>
            <div className="form-group">
              <label>Meta Title</label>
              <input
                type="text"
                value={settings.metaTitle || ''}
                onChange={(e) => handleChange('metaTitle', e.target.value)}
              />
              <small>50-60 characters recommended</small>
            </div>
            <div className="form-group">
              <label>Meta Description</label>
              <textarea
                rows={3}
                value={settings.metaDescription || ''}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
              />
              <small>150-160 characters recommended</small>
            </div>

            <h3>Analytics</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Google Analytics ID</label>
                <input
                  type="text"
                  value={settings.googleAnalyticsId || ''}
                  onChange={(e) => handleChange('googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="form-group">
                <label>Facebook Pixel ID</label>
                <input
                  type="text"
                  value={settings.facebookPixelId || ''}
                  onChange={(e) => handleChange('facebookPixelId', e.target.value)}
                  placeholder="XXXXXXXXXX"
                />
              </div>
            </div>

            <h3>Legal Pages</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Terms URL</label>
                <input
                  type="text"
                  value={settings.termsUrl || '/terms'}
                  onChange={(e) => handleChange('termsUrl', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Privacy URL</label>
                <input
                  type="text"
                  value={settings.privacyUrl || '/privacy'}
                  onChange={(e) => handleChange('privacyUrl', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Refund Policy</label>
              <textarea
                rows={4}
                value={settings.refundPolicy || ''}
                onChange={(e) => handleChange('refundPolicy', e.target.value)}
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section">
            <h3>Email Notifications</h3>

            <div className="notification-option">
              <div className="option-info">
                <CheckCircle size={24} />
                <div>
                  <h4>New Order Notifications</h4>
                  <p>Send email when a new order is placed</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.orderNotifications || false}
                  onChange={(e) => handleChange('orderNotifications', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="notification-option">
              <div className="option-info">
                <AlertTriangle size={24} />
                <div>
                  <h4>Low Stock Alerts</h4>
                  <p>Notify when product inventory is low</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.lowStockAlert || false}
                  onChange={(e) => handleChange('lowStockAlert', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {settings.lowStockAlert && (
              <div className="form-group indented">
                <label>Low Stock Threshold</label>
                <input
                  type="number"
                  value={settings.lowStockThreshold || 10}
                  onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value) || 10)}
                />
              </div>
            )}

            <div className="notification-option">
              <div className="option-info">
                <UserCog size={24} />
                <div>
                  <h4>New User Registrations</h4>
                  <p>Notify when a new user creates an account</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.newUserNotifications || false}
                  onChange={(e) => handleChange('newUserNotifications', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="notification-option">
              <div className="option-info">
                <Clock size={24} />
                <div>
                  <h4>Daily Reports</h4>
                  <p>Receive daily summary of sales and activity</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.dailyReports || false}
                  onChange={(e) => handleChange('dailyReports', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your store preferences and integrations</p>
      </div>

      <div className="settings-layout">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={16} className="arrow" />}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {renderContent()}

          {!loading && (
            <div className="settings-footer">
              <button 
                className="btn-secondary"
                onClick={fetchSettings}
                disabled={saving}
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button 
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="spinner-sm"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;