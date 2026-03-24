import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom'; 
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';
import '../styles/Shop.scss';
import '../assets/assets'

// Icons as components
const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// ==========================================
// HELPER: Get stock with fallback
// ==========================================
const getProductStock = (product) => {
  if (!product) return 0;
  // If stock is undefined/null, default to 10 for local products
  const stock = product.stock;
  if (stock === undefined || stock === null) return 10;
  return Number(stock) || 0;
};

// ==========================================
// HELPER: Check if product is in stock
// ==========================================
const isProductInStock = (product) => {
  return getProductStock(product) > 0;
};

const Shop = () => {
  const navigate = useNavigate();
  
  const {
    products,
    categories,
    subCategories,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    sortType,
    setSortType,
    getFilteredProducts,
    currency,
    addToCart,
    cartItems
  } = useContext(ShopContext);

  // Local states
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Get current subcategories based on selected category
  const currentSubCategories = useMemo(() => {
    return subCategories[selectedCategory] || [];
  }, [selectedCategory, subCategories]);

  // ==========================================
  // CORRECTED: Get filtered products with proper stock handling
  // ==========================================
  const filteredProducts = useMemo(() => {
    try {
      let result = getFilteredProducts();
      
      if (!Array.isArray(result)) {
        console.error('getFilteredProducts did not return an array');
        return [];
      }
      
      // Apply price filter
      result = result.filter(p => {
        const price = Number(p?.price) || 0;
        return price >= priceRange.min && price <= priceRange.max;
      });
      
      // CORRECTED: Apply stock filter with proper check
      if (showInStockOnly) {
        result = result.filter(p => isProductInStock(p));
      }
      
      return result;
    } catch (error) {
      console.error('Error filtering products:', error);
      return [];
    }
  }, [getFilteredProducts, priceRange, showInStockOnly]);

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (selectedSubCategory !== 'All') count++;
    if (search?.trim()) count++;
    if (showInStockOnly) count++;
    if (priceRange.min > 0 || priceRange.max < 1000) count++;
    return count;
  }, [selectedCategory, selectedSubCategory, search, showInStockOnly, priceRange]);

  // Handle category change
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setSelectedSubCategory('All');
    toast.info(`Category: ${category}`);
  }, [setSelectedCategory, setSelectedSubCategory]);

  // Handle subcategory change
  const handleSubCategoryChange = useCallback((subCategory) => {
    setSelectedSubCategory(subCategory);
  }, [setSelectedSubCategory]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setSearch('');
    setPriceRange({ min: 0, max: 1000 });
    setShowInStockOnly(false);
    toast.info('All filters cleared');
  }, [setSelectedCategory, setSelectedSubCategory, setSearch]);

  // ==========================================
  // CORRECTED: Handle add to cart with stock validation
  // ==========================================
  const handleAddToCart = useCallback((product, quantity = 1) => {
    if (!product) return;
    
    const productId = product._id || product.id;
    if (!productId) {
      console.error('Product has no ID');
      return;
    }

    // Check stock availability
    const availableStock = getProductStock(product);
    const currentInCart = cartItems?.[productId] || 0;
    
    if (currentInCart + quantity > availableStock) {
      toast.error(`Only ${availableStock} items available`);
      return;
    }

    if (typeof addToCart === 'function') {
      addToCart(productId, quantity);
    } else {
      console.error('addToCart is not a function in ShopContext');
    }
  }, [addToCart, cartItems]);

  // Product count in cart
  const getCartItemCount = useCallback((productId) => {
    return cartItems?.[productId] || 0;
  }, [cartItems]);

  // ==========================================
  // CORRECTED: Handle quantity change with stock validation
  // ==========================================
  const handleQuantityChange = useCallback((product, change) => {
    const productId = product?._id || product?.id;
    if (!productId) return;
    
    const currentQty = getCartItemCount(productId);
    const newQty = currentQty + change;
    const availableStock = getProductStock(product);
    
    if (newQty <= 0) {
      // Remove from cart
      handleAddToCart(product, -currentQty);
    } else if (newQty <= availableStock && newQty <= 10) {
      handleAddToCart(product, change);
    } else {
      toast.error(`Maximum ${Math.min(availableStock, 10)} items allowed`);
    }
  }, [getCartItemCount, handleAddToCart]);

  // Close mobile filters on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && showMobileFilters) {
        setShowMobileFilters(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showMobileFilters]);

  return (
    <div className="shop">
      {/* Hero Section */}
      <section className="shop__hero">
        <div className="shop__hero-content">
          <h1 className="shop__hero-title">
            Our <span className="text-gradient">Products</span>
          </h1>
          <p className="shop__hero-subtitle">
            Premium quality SARMs, peptides, and performance enhancers
          </p>
        </div>
      </section>

      <div className="shop__container">
        {/* Mobile Filter Toggle */}
        <button 
          className="shop__mobile-filter-toggle"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          aria-label="Toggle filters"
          aria-expanded={showMobileFilters}
        >
          <FilterIcon />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="filter-badge">{activeFiltersCount}</span>
          )}
        </button>

        <div className="shop__layout">
          {/* Sidebar Filters */}
          <aside className={`shop__sidebar ${showMobileFilters ? 'shop__sidebar--mobile-open' : ''}`}>
            <div className="shop__sidebar-header">
              <h3>Filters</h3>
              {activeFiltersCount > 0 && (
                <button 
                  className="shop__clear-filters"
                  onClick={clearAllFilters}
                  aria-label="Clear all filters"
                >
                  Clear all
                </button>
              )}
              <button 
                className="shop__close-sidebar"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filters"
              >
                <XIcon />
              </button>
            </div>

            {/* Search */}
            <div className="shop__filter-section">
              <div className="shop__search-box">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search products"
                />
                {search && (
                  <button 
                    className="shop__search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <XIcon />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="shop__filter-section">
              <h4 className="shop__filter-title">Categories</h4>
              <div className="shop__category-list">
                {categories?.map((category) => (
                  <div key={category} className="shop__category-item">
                    <button
                      className={`shop__category-btn ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(category)}
                      aria-pressed={selectedCategory === category}
                    >
                      <span>{category}</span>
                      {category !== 'All' && (
                        <span className="count">
                          {products?.filter(p => p?.category === category).length || 0}
                        </span>
                      )}
                    </button>
                    
                    {/* Subcategories */}
                    {selectedCategory === category && currentSubCategories.length > 1 && (
                      <div className="shop__subcategory-list">
                        {currentSubCategories.map((sub) => (
                          <button
                            key={sub}
                            className={`shop__subcategory-btn ${selectedSubCategory === sub ? 'active' : ''}`}
                            onClick={() => handleSubCategoryChange(sub)}
                            aria-pressed={selectedSubCategory === sub}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="shop__filter-section">
              <h4 className="shop__filter-title">Price Range</h4>
              <div className="shop__price-inputs">
                <div className="shop__price-input">
                  <span>{currency}</span>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Math.max(0, Number(e.target.value)) }))}
                    min="0"
                    aria-label="Minimum price"
                  />
                </div>
                <span className="shop__price-separator">-</span>
                <div className="shop__price-input">
                  <span>{currency}</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Math.max(0, Number(e.target.value)) }))}
                    min="0"
                    aria-label="Maximum price"
                  />
                </div>
              </div>
              <input
                type="range"
                className="shop__price-slider"
                min="0"
                max="1000"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                aria-label="Price range slider"
              />
            </div>

            {/* Stock Filter */}
            <div className="shop__filter-section">
              <label className="shop__checkbox-label">
                <input
                  type="checkbox"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  aria-label="Show in stock only"
                />
                <span className="checkmark"></span>
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="shop__active-filters">
                <h4 className="shop__filter-title">Active Filters</h4>
                <div className="shop__filter-tags">
                  {selectedCategory !== 'All' && (
                    <span className="filter-tag" onClick={() => setSelectedCategory('All')} role="button" tabIndex={0}>
                      {selectedCategory} <XIcon />
                    </span>
                  )}
                  {selectedSubCategory !== 'All' && (
                    <span className="filter-tag" onClick={() => setSelectedSubCategory('All')} role="button" tabIndex={0}>
                      {selectedSubCategory} <XIcon />
                    </span>
                  )}
                  {search && (
                    <span className="filter-tag" onClick={() => setSearch('')} role="button" tabIndex={0}>
                      Search: {search} <XIcon />
                    </span>
                  )}
                  {showInStockOnly && (
                    <span className="filter-tag" onClick={() => setShowInStockOnly(false)} role="button" tabIndex={0}>
                      In Stock <XIcon />
                    </span>
                  )}
                  {(priceRange.min > 0 || priceRange.max < 1000) && (
                    <span className="filter-tag" onClick={() => setPriceRange({ min: 0, max: 1000 })} role="button" tabIndex={0}>
                      {currency}{priceRange.min} - {currency}{priceRange.max} <XIcon />
                    </span>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="shop__main">
            {/* Toolbar */}
            <div className="shop__toolbar">
              <div className="shop__results-info">
                <span className="shop__results-count">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </span>
                {selectedCategory !== 'All' && (
                  <span className="shop__category-label">in {selectedCategory}</span>
                )}
              </div>

              <div className="shop__controls">
                {/* Sort */}
                <div className="shop__sort">
                  <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value)}
                    aria-label="Sort products"
                  >
                    <option value="relevant">Most Relevant</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="bestseller">Best Sellers</option>
                    <option value="newest">Newest</option>
                  </select>
                  <ChevronDownIcon />
                </div>

                {/* View Mode */}
                <div className="shop__view-toggle">
                  <button
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                    aria-label="Grid view"
                    aria-pressed={viewMode === 'grid'}
                  >
                    <GridIcon />
                  </button>
                  <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                    title="List view"
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                  >
                    <ListIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length > 0 ? (
              <div className={`shop__products shop__products--${viewMode}`}>
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => {
                    // Calculate stock info for this product
                    const productStock = getProductStock(product);
                    const inStock = productStock > 0;
                    const isLowStock = inStock && productStock < 10;
                    const cartQty = getCartItemCount(product?._id);
                    
                    return (
                      <motion.div
                        key={product?._id || index}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                        className={`shop__product-card shop__product-card--${viewMode}`}
                      >
                        {/* Product Image */}
                        <div className="shop__product-image-wrapper">
                          <img
                            src={product?.image?.[0] || '/images/default-product.jpg'}
                            alt={product?.name || 'Product'}
                            className="shop__product-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/default-product.jpg';
                            }}
                            loading="lazy"
                          />
                          
                          {/* ==========================================
                              CORRECTED: Stock badges with proper logic
                          ========================================== */}
                          {product?.bestseller && (
                            <span className="shop__product-badge shop__product-badge--bestseller">
                              Best Seller
                            </span>
                          )}
                          {isLowStock && (
                            <span className="shop__product-badge shop__product-badge--low-stock">
                              Only {productStock} left
                            </span>
                          )}
                          {!inStock && (
                            <span className="shop__product-badge shop__product-badge--out-of-stock">
                              Out of Stock
                            </span>
                          )}
                          
                          {/* Quick Actions */}
                          <div className="shop__product-actions">
                            <button
                              className="shop__quick-view"
                              onClick={() => navigate(`/product/${product?._id}`)}
                              aria-label={`Quick view ${product?.name}`}
                            >
                              Quick View
                            </button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="shop__product-info">
                          <div className="shop__product-meta">
                            <span className="shop__product-category">{product?.category}</span>
                            {product?.subCategory && product?.subCategory !== 'All' && (
                              <span className="shop__product-subcategory">{product.subCategory}</span>
                            )}
                          </div>
                          
                          <h3 className="shop__product-name">
                            <Link to={`/product/${product?._id}`}>{product?.name}</Link>
                          </h3>
                          
                          <p className="shop__product-description">{product?.description}</p>
                          
                          {/* Rating */}
                          {product?.rating && (
                            <div className="shop__product-rating">
                              <div className="stars">
                                {'★'.repeat(Math.floor(product.rating))}
                                {product.rating % 1 !== 0 && '½'}
                              </div>
                              <span className="rating-count">({product?.reviews || 0})</span>
                            </div>
                          )}

                          {/* Price & Stock */}
                          <div className="shop__product-footer">
                            <div className="shop__product-price">
                              <span className="currency">{currency}</span>
                              <span className="amount">{(product?.price || 0).toFixed(2)}</span>
                            </div>
                            
                            {viewMode === 'list' && (
                              <div className="shop__product-stock">
                                <span className={`stock-indicator ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                                  {inStock ? '✓ In Stock' : '✗ Out of Stock'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* ==========================================
                              CORRECTED: Add to Cart with stock validation
                          ========================================== */}
                          <div className="shop__product-cart">
                            {cartQty > 0 ? (
                              <div className="shop__quantity-control">
                                <button
                                  onClick={() => handleQuantityChange(product, -1)}
                                  disabled={cartQty <= 0}
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span aria-live="polite">{cartQty}</span>
                                <button
                                  onClick={() => handleQuantityChange(product, 1)}
                                  disabled={cartQty >= 10 || cartQty >= productStock}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                className={`shop__add-btn ${!inStock ? 'disabled' : ''}`}
                                onClick={() => handleAddToCart(product, 1)}
                                disabled={!inStock}
                                aria-label={!inStock ? 'Out of stock' : `Add ${product?.name} to cart`}
                              >
                                {!inStock ? 'Out of Stock' : 'Add to Cart'}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* Empty State */
              <div className="shop__empty">
                <div className="shop__empty-icon" role="img" aria-label="Search">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query</p>
                <button 
                  className="btn btn--primary"
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;