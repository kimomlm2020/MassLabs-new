import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/Products.scss';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const token = localStorage.getItem('adminToken');

  const categories = ['All', 'Injectables', 'Orals', 'SARMs', 'PCT', 'Peptides'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${backendUrl}/api/product/remove`, {
        headers: { token },
        data: { id }
      });
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'stock') return (a.stock || 0) - (b.stock || 0);
      return 0;
    });

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product inventory</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => navigate('/admin/products/add')}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(c => (
              <option key={c} value={c.toLowerCase()}>{c}</option>
            ))}
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedProducts.length} selected</span>
          <button className="btn-danger">Delete Selected</button>
        </div>
      )}

      {/* Products Table */}
      <div className="table-container">
        <table className="data-table products-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox"
                  checked={selectedProducts.length === products.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Sales</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product._id}>
                <td>
                  <input 
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => {
                      setSelectedProducts(prev => 
                        prev.includes(product._id)
                          ? prev.filter(id => id !== product._id)
                          : [...prev, product._id]
                      );
                    }}
                  />
                </td>
                <td>
                  <div className="product-cell">
                    <img 
                      src={product.image?.[0] || '/placeholder.png'} 
                      alt={product.name}
                    />
                    <div>
                      <span className="product-name">{product.name}</span>
                      <span className="product-sku">{product.sku || 'N/A'}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{product.category}</span>
                </td>
                <td>£{product.price?.toFixed(2)}</td>
                <td>
                  <span className={`stock-badge ${product.stock > 10 ? 'in' : 'low'}`}>
                    {product.stock || 0} units
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${product.status || 'active'}`}>
                    {product.status || 'Active'}
                  </span>
                </td>
                <td>{product.sales || 0}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => navigate(`/admin/products/edit/${product._id}`)}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(product._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span>Showing {filteredProducts.length} of {products.length} products</span>
        <div className="page-buttons">
          <button disabled>Previous</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Products;