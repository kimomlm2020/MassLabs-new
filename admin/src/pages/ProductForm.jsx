import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  ArrowLeft, 
  X, 
  Save,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import '../styles/ProductForm.scss';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    subCategory: '',
    sku: '',
    concentration: '',
    volume: '',
    form: 'Other',
    bestseller: false
  });

  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const categories = ['Injectables', 'Orals', 'SARMs', 'PCT', 'Peptides'];
  
  const subCategories = {
    'Injectables': ['Testosterone', 'Trenbolone', 'Nandrolone', 'Masteron', 'Primobolan', 'Boldenone', 'Other'],
    'Orals': ['Dianabol', 'Anavar', 'Winstrol', 'Anadrol', 'Turinabol', 'Superdrol', 'Other'],
    'SARMs': ['Ostarine', 'Ligandrol', 'RAD-140', 'YK-11', 'Cardarine', 'Stenabolic', 'Other'],
    'PCT': ['Clomid', 'Nolvadex', 'HCG', 'Arimidex', 'Aromasin', 'Other'],
    'Peptides': ['GHRP-2', 'GHRP-6', 'CJC-1295', 'Ipamorelin', 'TB-500', 'BPC-157', 'Other']
  };

  const forms = ['Vial', 'Ampoule', 'Tablet', 'Capsule', 'Powder', 'Liquid', 'Other'];

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/product/single`, {
        productId: id
      });
      
      if (response.data.success) {
        const product = response.data.product;
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          stock: product.stock?.toString() || '',
          category: product.category || '',
          subCategory: product.subCategory || '',
          sku: product.sku || '',
          concentration: product.specifications?.concentration || '',
          volume: product.specifications?.volume || '',
          form: product.specifications?.form || 'Other',
          bestseller: product.bestseller || false
        });
      }
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      category,
      subCategory: ''
    }));
  };

  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image too large (max 5MB)');
        return;
      }
      setImage(file);
    } else {
      toast.error('Please select a valid image');
    }
  };

  const removeImage = (setImage) => {
    setImage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (!formData.subCategory) {
      toast.error('Sub-category is required');
      return;
    }
    if (!formData.sku.trim()) {
      toast.error('SKU is required');
      return;
    }
    if (!image1 && !image2 && !image3 && !image4) {
      toast.error('At least one image is required');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock || '0');
      formDataToSend.append("category", formData.category);
      formDataToSend.append("subCategory", formData.subCategory);
      formDataToSend.append("sku", formData.sku.trim().toUpperCase());
      formDataToSend.append("concentration", formData.concentration || '');
      formDataToSend.append("volume", formData.volume || '');
      formDataToSend.append("form", formData.form);
      formDataToSend.append("bestseller", formData.bestseller.toString());

      if (isEditMode) {
        formDataToSend.append("productId", id);
      }

      image1 && formDataToSend.append("image1", image1);
      image2 && formDataToSend.append("image2", image2);
      image3 && formDataToSend.append("image3", image3);
      image4 && formDataToSend.append("image4", image4);

      const token = localStorage.getItem('adminToken') || localStorage.getItem('token') || '';

      const config = {
        headers: { token }
      };

      let response;
      
      if (isEditMode) {
        response = await axios.put(
          `${backendUrl}/api/product/update`,
          formDataToSend,
          config
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/product/add`,
          formDataToSend,
          config
        );
      }

      if (response.data.success) {
        toast.success(
          isEditMode 
            ? 'Product updated successfully!' 
            : 'Product added successfully!'
        );
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: '',
          subCategory: '',
          sku: '',
          concentration: '',
          volume: '',
          form: 'Other',
          bestseller: false
        });
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        
        navigate('/admin/products');
      } else {
        throw new Error(response.data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.errors) {
            Object.values(data.errors).forEach(err => toast.error(err));
          } else if (data.message) {
            toast.error(data.message);
          } else {
            toast.error('Invalid data. Please check your inputs.');
          }
        } else if (status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/admin/login');
        } else if (status === 403) {
          toast.error('Admin access required.');
        } else if (status === 409 || data.field === 'sku') {
          toast.error('SKU already exists. Please use a unique SKU.');
        } else {
          toast.error(data.message || `Server error: ${status}`);
        }
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check your connection.');
      } else {
        toast.error(error.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="product-form-page loading">
        <Loader2 className="spinner" size={48} />
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="product-form-page">
      <button onClick={() => navigate('/admin/products')} className="back-btn">
        <ArrowLeft size={20} />
        <span>Back to Products</span>
      </button>

      <div className="page-header">
        <div className="header-content">
          <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="subtitle">
            {isEditMode 
              ? 'Update product details and images' 
              : 'Create a new product with images and specifications'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        {/* Images Section */}
        <div className="form-section full-width">
          <h3>Product Images * (Max 4)</h3>
          
          <div className="image-upload-row">
            {/* Image 1 */}
            <div className="image-upload-box">
              <label htmlFor="image1">
                <div className={`upload-placeholder ${image1 ? 'has-image' : ''}`}>
                  {image1 ? (
                    <img src={URL.createObjectURL(image1)} alt="Preview 1" />
                  ) : (
                    <>
                      <ImageIcon size={24} />
                      <span>Image 1</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  id="image1"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageChange(e, setImage1)}
                />
              </label>
              {image1 && (
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={() => removeImage(setImage1)}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Image 2 */}
            <div className="image-upload-box">
              <label htmlFor="image2">
                <div className={`upload-placeholder ${image2 ? 'has-image' : ''}`}>
                  {image2 ? (
                    <img src={URL.createObjectURL(image2)} alt="Preview 2" />
                  ) : (
                    <>
                      <ImageIcon size={24} />
                      <span>Image 2</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  id="image2"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageChange(e, setImage2)}
                />
              </label>
              {image2 && (
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={() => removeImage(setImage2)}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Image 3 */}
            <div className="image-upload-box">
              <label htmlFor="image3">
                <div className={`upload-placeholder ${image3 ? 'has-image' : ''}`}>
                  {image3 ? (
                    <img src={URL.createObjectURL(image3)} alt="Preview 3" />
                  ) : (
                    <>
                      <ImageIcon size={24} />
                      <span>Image 3</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  id="image3"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageChange(e, setImage3)}
                />
              </label>
              {image3 && (
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={() => removeImage(setImage3)}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Image 4 */}
            <div className="image-upload-box">
              <label htmlFor="image4">
                <div className={`upload-placeholder ${image4 ? 'has-image' : ''}`}>
                  {image4 ? (
                    <img src={URL.createObjectURL(image4)} alt="Preview 4" />
                  ) : (
                    <>
                      <ImageIcon size={24} />
                      <span>Image 4</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  id="image4"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageChange(e, setImage4)}
                />
              </label>
              {image4 && (
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={() => removeImage(setImage4)}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Testosterone Enanthate 250mg"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed product description..."
                rows={5}
                disabled={loading}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (EUR) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock Quantity</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sku">SKU *</label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g., TEST-250-001"
                  disabled={loading || isEditMode}
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="bestseller"
                    checked={formData.bestseller}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>Mark as Bestseller</span>
                </label>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="form-section">
            <h3>Classification</h3>
            
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                disabled={loading}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subCategory">Sub-Category *</label>
              <select
                id="subCategory"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                disabled={!formData.category || loading}
                required
              >
                <option value="">
                  {formData.category 
                    ? 'Select Sub-Category' 
                    : 'Select Category First'}
                </option>
                {formData.category && subCategories[formData.category]?.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <h3 style={{ marginTop: '2rem' }}>Specifications</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="concentration">Concentration</label>
                <input
                  type="text"
                  id="concentration"
                  name="concentration"
                  value={formData.concentration}
                  onChange={handleChange}
                  placeholder="e.g., 250mg/ml"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="volume">Volume</label>
                <input
                  type="text"
                  id="volume"
                  name="volume"
                  value={formData.volume}
                  onChange={handleChange}
                  placeholder="e.g., 10ml"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="form">Form</label>
              <select
                id="form"
                name="form"
                value={formData.form}
                onChange={handleChange}
                disabled={loading}
              >
                {forms.map(form => (
                  <option key={form} value={form}>{form}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/products')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{isEditMode ? 'Update Product' : 'Add Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;