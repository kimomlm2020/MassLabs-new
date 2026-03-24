import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Shield, 
  CheckCircle, 
  Phone,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/AddUser.scss';

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  // Validation rules
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'name':
        if (!value || value.length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters and spaces';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
          return 'Password must contain uppercase, lowercase, number and special character';
        }
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      case 'phone':
        if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) return 'Please enter a valid phone number';
        return '';
      default:
        return '';
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      if (key !== 'phone' && key !== 'status') { // Optional fields
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      phone: true
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post(
        `${backendUrl}/api/user/register`,
        {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          role: formData.role,
          status: formData.status
        },
        { 
          headers: { 
            token,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.success) {
        toast.success('User created successfully! 🎉');
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          role: 'customer',
          status: 'active'
        });
        // Navigate after short delay
        setTimeout(() => navigate('/admin/users'), 1500);
      } else {
        toast.error(response.data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Create user error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user. Please try again.';
      toast.error(errorMessage);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin':
        return 'Full access to all features, users, orders, and settings';
      case 'moderator':
        return 'Can manage orders and products, but cannot manage users or settings';
      case 'customer':
        return 'Standard shopping access, can place orders and manage own profile';
      default:
        return '';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'moderator': return 'role-moderator';
      default: return 'role-customer';
    }
  };

  return (
    <div className="add-user-page">
      <div className="page-header">
        <button 
          className="btn-back" 
          onClick={() => navigate('/admin/users')}
          disabled={loading}
        >
          <ArrowLeft size={18} />
          <span>Back to Users</span>
        </button>
        
        <div className="header-content">
          <h1>Create New User</h1>
          <p>Add a new member to your platform with specific role and permissions</p>
        </div>
      </div>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit} className="user-form" noValidate>
          {/* Basic Information Section */}
          <section className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <User size={20} />
              </div>
              <div className="section-title">
                <h3>Basic Information</h3>
                <p>Personal details of the new user</p>
              </div>
            </div>

            <div className="form-grid">
              <div className={`form-field ${errors.name && touched.name ? 'has-error' : ''} ${formData.name && !errors.name ? 'is-valid' : ''}`}>
                <label htmlFor="name">
                  <User size={16} />
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. John Doe"
                  disabled={loading}
                  autoComplete="off"
                />
                {errors.name && touched.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className={`form-field ${errors.email && touched.email ? 'has-error' : ''} ${formData.email && !errors.email ? 'is-valid' : ''}`}>
                <label htmlFor="email">
                  <Mail size={16} />
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="john.doe@example.com"
                  disabled={loading}
                  autoComplete="off"
                />
                {errors.email && touched.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className={`form-field ${errors.phone ? 'has-error' : ''}`}>
                <label htmlFor="phone">
                  <Phone size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+1 (555) 123-4567"
                  disabled={loading}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <Lock size={20} />
              </div>
              <div className="section-title">
                <h3>Security</h3>
                <p>Set a secure password for the account</p>
              </div>
            </div>

            <div className="form-grid two-columns">
              <div className={`form-field ${errors.password && touched.password ? 'has-error' : ''} ${formData.password && !errors.password ? 'is-valid' : ''}`}>
                <label htmlFor="password">
                  <Lock size={16} />
                  Password <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Min 8 characters"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <span className="error-message">{errors.password}</span>
                )}
                <span className="help-text">Must include uppercase, lowercase, number & special character</span>
              </div>

              <div className={`form-field ${errors.confirmPassword && touched.confirmPassword ? 'has-error' : ''} ${formData.confirmPassword && !errors.confirmPassword ? 'is-valid' : ''}`}>
                <label htmlFor="confirmPassword">
                  <CheckCircle size={16} />
                  Confirm Password <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Repeat password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </section>

          {/* Role & Permissions Section */}
          <section className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <Shield size={20} />
              </div>
              <div className="section-title">
                <h3>Role & Permissions</h3>
                <p>Define user access level and account status</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="role">
                  <Shield size={16} />
                  User Role <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select 
                    id="role"
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="customer">Customer</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className={`role-badge ${getRoleBadgeColor(formData.role)}`}>
                  {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                </div>
                <p className="role-description">{getRoleDescription(formData.role)}</p>
              </div>

              <div className="form-field">
                <label>Account Status</label>
                <div className="status-options">
                  <label className={`status-card ${formData.status === 'active' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <div className="status-indicator active"></div>
                    <div className="status-content">
                      <span className="status-label">Active</span>
                      <span className="status-desc">User can login immediately</span>
                    </div>
                  </label>
                  
                  <label className={`status-card ${formData.status === 'inactive' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <div className="status-indicator inactive"></div>
                    <div className="status-content">
                      <span className="status-label">Inactive</span>
                      <span className="status-desc">Account is disabled</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate('/admin/users')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Creating User...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>

        {/* Summary Card */}
        <aside className="summary-card">
          <h4>User Preview</h4>
          <div className="preview-avatar">
            {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="preview-info">
            <p className="preview-name">{formData.name || 'New User'}</p>
            <p className="preview-email">{formData.email || 'No email set'}</p>
            <div className="preview-badges">
              <span className={`badge role-${formData.role}`}>
                {formData.role}
              </span>
              <span className={`badge status-${formData.status}`}>
                {formData.status}
              </span>
            </div>
          </div>
          <div className="preview-permissions">
            <h5>Permissions:</h5>
            <ul>
              {formData.role === 'admin' && (
                <>
                  <li>✓ Full system access</li>
                  <li>✓ Manage all users</li>
                  <li>✓ Manage orders & products</li>
                  <li>✓ Access settings & analytics</li>
                </>
              )}
              {formData.role === 'moderator' && (
                <>
                  <li>✓ Manage orders</li>
                  <li>✓ Manage products</li>
                  <li>✗ Cannot manage users</li>
                  <li>✗ No settings access</li>
                </>
              )}
              {formData.role === 'customer' && (
                <>
                  <li>✓ Place orders</li>
                  <li>✓ Manage own profile</li>
                  <li>✗ No admin access</li>
                  <li>✗ Cannot manage content</li>
                </>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AddUser;