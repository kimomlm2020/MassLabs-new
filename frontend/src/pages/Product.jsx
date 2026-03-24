import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RelatedProducts from '../components/RelatedProducts';
import '../styles/Product.scss';

// Mock reviews for local mode
const MOCK_REVIEWS = [
    { _id: '1', rating: 5, comment: 'Excellent quality product, very satisfied with results!', user: { name: 'John D.' }, date: new Date().toISOString() },
    { _id: '2', rating: 4, comment: 'Good product, fast shipping. Will order again.', user: { name: 'Mike R.' }, date: new Date(Date.now() - 86400000).toISOString() },
    { _id: '3', rating: 5, comment: 'Lab tested and verified. Highly recommended.', user: { name: 'Sarah K.' }, date: new Date(Date.now() - 172800000).toISOString() }
];

const Product = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { 
        products, 
        currency, 
        addToCart, 
        cartItems, 
        backendUrl,
        token,
        user,
        isLocalMode
    } = useContext(ShopContext);
    
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);

    // Find product from local products array (from assets.js)
    const findProductLocally = useCallback(() => {
        if (!products || products.length === 0) return null;
        
        // Try to find by _id first, then by id
        let found = products.find(item => item._id === productId);
        if (!found) {
            found = products.find(item => item.id === productId);
        }
        
        return found;
    }, [products, productId]);

    // Fetch product data - PRIORITIZE LOCAL DATA
    useEffect(() => {
        setLoading(true);
        
        // First, always try to find product locally from assets
        const localProduct = findProductLocally();
        
        if (localProduct) {
            console.log('✅ Product found locally:', localProduct.name);
            setProductData(localProduct);
            
            // Set default variant if exists
            if (localProduct.variants && localProduct.variants.length > 0) {
                setSelectedVariant(localProduct.variants[0]);
            }
            
            // Use mock reviews for local products
            setReviews(MOCK_REVIEWS);
            setLoading(false);
        } else if (!isLocalMode && backendUrl) {
            // Only try API if not in local mode and backend is configured
            fetchProductFromAPI();
        } else {
            console.log('❌ Product not found locally:', productId);
            toast.error('Product not found');
            navigate('/shop');
            setLoading(false);
        }
    }, [findProductLocally, isLocalMode, backendUrl, productId, navigate]);

    // API fallback (only used when product not in local assets)
    const fetchProductFromAPI = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/api/product/${productId}`, {
                signal: AbortSignal.timeout(5000)
            });
            const data = await response.json();
            
            if (data.success && data.product) {
                setProductData(data.product);
                if (data.product.variants?.length > 0) {
                    setSelectedVariant(data.product.variants[0]);
                }
                // Fetch reviews from API for API-loaded products
                fetchReviewsFromAPI();
            } else {
                toast.error('Product not found');
                navigate('/shop');
            }
        } catch (error) {
            console.error('API fetch failed:', error);
            toast.error('Product not available');
            navigate('/shop');
        } finally {
            setLoading(false);
        }
    }, [backendUrl, productId, navigate]);

    // Fetch reviews from API (only for API-loaded products)
    const fetchReviewsFromAPI = useCallback(async () => {
        if (isLocalMode || !backendUrl) return;
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${backendUrl}/api/review/${productId}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            if (data.success && data.reviews) {
                setReviews(data.reviews);
            }
        } catch (error) {
            console.log('Reviews fetch failed, using mock data');
            setReviews(MOCK_REVIEWS);
        }
    }, [backendUrl, productId, isLocalMode]);

    // ==========================================
    // CORRECTED: Stock status calculation
    // ==========================================
    const stockStatus = useMemo(() => {
        if (!productData) {
            return { hasStock: false, stockCount: 0, displayText: 'Out of Stock', cssClass: 'out-of-stock' };
        }

        // Check variant stock first, then product stock
        let relevantStock;
        
        if (selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock !== null) {
            relevantStock = selectedVariant.stock;
        } else if (productData.stock !== undefined && productData.stock !== null) {
            relevantStock = productData.stock;
        } else {
            // Default to 10 if no stock specified (for local products)
            relevantStock = 10;
        }
        
        // Convert to number and validate
        const stockNumber = Number(relevantStock);
        const isValidStock = !isNaN(stockNumber) && relevantStock !== '' && relevantStock !== false;
        const hasStock = isValidStock && stockNumber > 0;
        
        return {
            hasStock,
            stockCount: isValidStock ? stockNumber : 0,
            displayText: hasStock ? `In Stock (${stockNumber} units)` : 'Out of Stock',
            cssClass: hasStock ? 'in-stock' : 'out-of-stock',
            isLowStock: hasStock && stockNumber < 10
        };
    }, [productData, selectedVariant]);

    // Handle add to cart
    const handleAddToCart = useCallback(() => {
        if (!productData) {
            toast.error('Product data not available');
            return;
        }
        
        // Check stock using corrected stockStatus
        if (!stockStatus.hasStock) {
            toast.error('Product is out of stock');
            return;
        }

        // Check variant selection
        if (productData.variants?.length > 0 && !selectedVariant) {
            toast.error('Please select a variant');
            return;
        }

        // Determine item ID (use variant if selected, otherwise product ID)
        const itemId = selectedVariant?._id || selectedVariant?.id || productData._id || productData.id;
        
        if (!itemId) {
            toast.error('Invalid product ID');
            return;
        }
        
        // Check current quantity in cart
        const currentQty = cartItems?.[itemId] || 0;
        const newQty = currentQty + quantity;
        
        // Validate against available stock
        if (newQty > stockStatus.stockCount) {
            toast.error(`Only ${stockStatus.stockCount} items available`);
            return;
        }

        // Add to cart using context function
        addToCart(itemId, quantity);
    }, [productData, selectedVariant, quantity, cartItems, addToCart, stockStatus]);

    // Handle buy now
    const handleBuyNow = useCallback(() => {
        handleAddToCart();
        navigate('/cart');
    }, [handleAddToCart, navigate]);

    // Submit review
    const submitReview = useCallback(async (e) => {
        e.preventDefault();
        
        if (!token) {
            toast.error('Please login to leave a review');
            navigate('/login');
            return;
        }

        // In local mode, save review locally only
        if (isLocalMode) {
            const localReview = {
                _id: Date.now().toString(),
                rating: newReview.rating,
                comment: newReview.comment,
                user: { name: user?.name || 'You' },
                date: new Date().toISOString()
            };
            setReviews(prev => [localReview, ...prev]);
            setNewReview({ rating: 5, comment: '' });
            setShowReviewForm(false);
            toast.success('Review added (saved locally)');
            return;
        }

        // Try to submit to API
        try {
            const response = await fetch(`${backendUrl}/api/review/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token
                },
                body: JSON.stringify({
                    productId,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Review submitted!');
                setReviews(prev => [data.review, ...prev]);
                setNewReview({ rating: 5, comment: '' });
                setShowReviewForm(false);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Review submission failed:', error);
            // Fallback to local
            const localReview = {
                _id: Date.now().toString(),
                rating: newReview.rating,
                comment: newReview.comment,
                user: { name: user?.name || 'You' },
                date: new Date().toISOString()
            };
            setReviews(prev => [localReview, ...prev]);
            toast.info('Review saved locally (server unavailable)');
        }
    }, [token, backendUrl, productId, newReview, user, isLocalMode, navigate]);

    // Calculate average rating
    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews]);

    // Check if item is in cart (cartItems is { productId: quantity })
    const isInCart = useMemo(() => {
        if (!cartItems || !productData) return false;
        const itemId = selectedVariant?._id || selectedVariant?.id || productData._id || productData.id;
        return itemId ? cartItems[itemId] > 0 : false;
    }, [cartItems, productData, selectedVariant]);

    // Get current quantity in cart
    const cartQuantity = useMemo(() => {
        if (!cartItems || !productData) return 0;
        const itemId = selectedVariant?._id || selectedVariant?.id || productData._id || productData.id;
        return itemId ? (cartItems[itemId] || 0) : 0;
    }, [cartItems, productData, selectedVariant]);

    // Loading state
    if (loading) {
        return (
            <div className="app product-page">
                <Navbar />
                <div className="product-loading">
                    <div className="spinner"></div>
                    <p>Loading product details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    // Product not found
    if (!productData) {
        return (
            <div className="app product-page">
                <Navbar />
                <div className="product-not-found">
                    <h2>Product Not Found</h2>
                    <p>The product you're looking for doesn't exist or has been removed.</p>
                    <button onClick={() => navigate('/shop')} className="btn-primary">
                        Browse Products
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    // Prepare display data
    const images = productData.images || productData.image || [];
    const currentPrice = selectedVariant ? selectedVariant.price : productData.price;
    const displayPrice = typeof currentPrice === 'number' ? currentPrice.toFixed(2) : currentPrice;
    const productName = productData.name || 'Unknown Product';
    const productCategory = productData.category || 'Uncategorized';

    return (
        <div className="app product-page">
            <Navbar />
            
            <div className="product-container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <span onClick={() => navigate('/')}>Home</span>
                    <span>/</span>
                    <span onClick={() => navigate('/shop')}>Shop</span>
                    <span>/</span>
                    <span onClick={() => navigate(`/shop?category=${productCategory}`)}>
                        {productCategory}
                    </span>
                    <span>/</span>
                    <span className="current">{productName}</span>
                </nav>

                {/* Main Product Section */}
                <div className="product-main">
                    {/* Image Gallery */}
                    <div className="product-gallery">
                        <div className="main-image">
                            <img 
                                src={images[selectedImage] || '/placeholder-product.png'} 
                                alt={productName}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-product.png';
                                }}
                            />
                            {productData.bestseller && (
                                <span className="product-badge bestseller">Best Seller</span>
                            )}
                            {/* CORRECTED: Use stockStatus for badge */}
                            {!stockStatus.hasStock && (
                                <span className="product-badge out-of-stock">Out of Stock</span>
                            )}
                            {productData.new && stockStatus.hasStock && (
                                <span className="product-badge new">New</span>
                            )}
                        </div>
                        
                        {images.length > 1 && (
                            <div className="thumbnail-list">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                        aria-label={`View image ${index + 1}`}
                                    >
                                        <img 
                                            src={img} 
                                            alt={`${productName} view ${index + 1}`}
                                            onError={(e) => {
                                                e.target.src = '/placeholder-product.png';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-info">
                        <div className="product-header">
                            <span className="product-category">{productCategory}</span>
                            <h1 className="product-name">{productName}</h1>
                            
                            {/* Rating */}
                            <div className="product-rating">
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span 
                                            key={star} 
                                            className={star <= Math.round(averageRating) ? 'filled' : ''}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <span className="rating-text">
                                    {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="product-price">
                            <span className="current-price">{currency}{displayPrice}</span>
                            {productData.oldPrice && (
                                <span className="old-price">{currency}{productData.oldPrice}</span>
                            )}
                        </div>

                        {/* Short Description */}
                        <p className="product-short-desc">
                            {productData.shortDescription || productData.description?.substring(0, 150)}...
                        </p>

                        {/* Variants Selection */}
                        {productData.variants?.length > 0 && (
                            <div className="variant-selection">
                                <label>Select Option:</label>
                                <div className="variant-options">
                                    {productData.variants.map((variant) => (
                                        <button
                                            key={variant._id || variant.id || Math.random()}
                                            className={`variant-btn ${selectedVariant?._id === variant._id ? 'selected' : ''}`}
                                            onClick={() => setSelectedVariant(variant)}
                                        >
                                            <span className="variant-name">{variant.name}</span>
                                            <span className="variant-price">{currency}{variant.price}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CORRECTED: Quantity with proper stock checking */}
                        <div className="quantity-selector">
                            <label>Quantity:</label>
                            <div className="quantity-controls">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                >-</button>
                                <span>{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(quantity + 1)}
                                    disabled={!stockStatus.hasStock || quantity >= stockStatus.stockCount}
                                    aria-label="Increase quantity"
                                >+</button>
                            </div>
                            {/* CORRECTED: Stock warning using stockStatus */}
                            {stockStatus.isLowStock && (
                                <span className="stock-warning">Only {stockStatus.stockCount} left!</span>
                            )}
                            {cartQuantity > 0 && (
                                <span className="in-cart-qty">{cartQuantity} in cart</span>
                            )}
                        </div>

                        {/* CORRECTED: Action Buttons with proper stock checking */}
                        <div className="product-actions">
                            <button 
                                className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
                                onClick={handleAddToCart}
                                disabled={!stockStatus.hasStock}
                            >
                                {!stockStatus.hasStock 
                                    ? 'Out of Stock' 
                                    : isInCart 
                                        ? '✓ Added to Cart' 
                                        : 'Add to Cart'
                                }
                            </button>
                            <button 
                                className="buy-now-btn" 
                                onClick={handleBuyNow}
                                disabled={!stockStatus.hasStock}
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="trust-badges">
                            <div className="badge">
                                <span className="icon">🔬</span>
                                <span>Lab Tested</span>
                            </div>
                            <div className="badge">
                                <span className="icon">🚚</span>
                                <span>Fast Shipping</span>
                            </div>
                            <div className="badge">
                                <span className="icon">🔒</span>
                                <span>Secure Payment</span>
                            </div>
                            <div className="badge">
                                <span className="icon">✓</span>
                                <span>99% Purity</span>
                            </div>
                        </div>

                        {/* CORRECTED: Product Meta with proper stock display */}
                        <div className="product-meta">
                            <div className="meta-item">
                                <span>SKU:</span>
                                <span>{productData.sku || productData._id?.slice(-8).toUpperCase() || 'N/A'}</span>
                            </div>
                            <div className="meta-item">
                                <span>Category:</span>
                                <span>{productCategory}</span>
                            </div>
                            {productData.subCategory && (
                                <div className="meta-item">
                                    <span>Type:</span>
                                    <span>{productData.subCategory}</span>
                                </div>
                            )}
                            <div className="meta-item">
                                <span>Availability:</span>
                                {/* CORRECTED: Using stockStatus */}
                                <span className={stockStatus.cssClass}>
                                    {stockStatus.displayText}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="product-tabs">
                    <div className="tabs-header">
                        {['description', 'specs', 'reviews', 'shipping'].map((tab) => (
                            <button 
                                key={tab}
                                className={activeTab === tab ? 'active' : ''}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {tab === 'reviews' && ` (${reviews.length})`}
                            </button>
                        ))}
                    </div>

                    <div className="tabs-content">
                        {activeTab === 'description' && (
                            <div className="tab-panel description-panel">
                                <div className="full-description">
                                    <h3>Product Overview</h3>
                                    <p>{productData.description || 'No description available.'}</p>
                                    
                                    {productData.benefits && productData.benefits.length > 0 && (
                                        <>
                                            <h4>Key Benefits</h4>
                                            <ul>
                                                {productData.benefits.map((benefit, idx) => (
                                                    <li key={idx}>{benefit}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}

                                    {productData.usage && (
                                        <>
                                            <h4>Recommended Usage</h4>
                                            <p>{productData.usage}</p>
                                        </>
                                    )}

                                    {productData.storage && (
                                        <div className="storage-info">
                                            <h4>Storage Instructions</h4>
                                            <p>{productData.storage}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div className="tab-panel specs-panel">
                                <table className="specs-table">
                                    <tbody>
                                        {[
                                            { label: 'Chemical Name', key: 'chemicalName' },
                                            { label: 'Molecular Formula', key: 'molecularFormula' },
                                            { label: 'Molecular Weight', key: 'molecularWeight' },
                                            { label: 'CAS Number', key: 'casNumber' },
                                            { label: 'Purity', key: 'purity', default: '≥99%' },
                                            { label: 'Appearance', key: 'appearance', default: 'White crystalline powder' },
                                            { label: 'Solubility', key: 'solubility', default: 'DMSO, Ethanol' }
                                        ].map(({ label, key, default: defaultValue }) => (
                                            <tr key={key}>
                                                <td>{label}</td>
                                                <td>{productData[key] || defaultValue || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {productData.certificateUrl && (
                                    <a 
                                        href={productData.certificateUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="certificate-link"
                                    >
                                        📄 Download COA (Certificate of Analysis)
                                    </a>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="tab-panel reviews-panel">
                                <div className="reviews-summary">
                                    <div className="average-rating">
                                        <span className="big-rating">{averageRating}</span>
                                        <div className="stars">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span 
                                                    key={star} 
                                                    className={star <= Math.round(averageRating) ? 'filled' : ''}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                        <span>Based on {reviews.length} reviews</span>
                                    </div>
                                    <button 
                                        className="write-review-btn"
                                        onClick={() => setShowReviewForm(!showReviewForm)}
                                    >
                                        {showReviewForm ? 'Cancel' : 'Write a Review'}
                                    </button>
                                </div>

                                {showReviewForm && (
                                    <form className="review-form" onSubmit={submitReview}>
                                        <div className="rating-input">
                                            <label>Your Rating:</label>
                                            <select 
                                                value={newReview.rating}
                                                onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
                                            >
                                                {[5, 4, 3, 2, 1].map(num => (
                                                    <option key={num} value={num}>{num} Stars</option>
                                                ))}
                                            </select>
                                        </div>
                                        <textarea
                                            placeholder="Share your experience with this product..."
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                            required
                                            rows="4"
                                        />
                                        <button type="submit" className="submit-review-btn">
                                            Submit Review
                                        </button>
                                    </form>
                                )}

                                <div className="reviews-list">
                                    {reviews.length === 0 ? (
                                        <p className="no-reviews">No reviews yet. Be the first to review!</p>
                                    ) : (
                                        reviews.map((review) => (
                                            <div key={review._id || review.id || Math.random()} className="review-item">
                                                <div className="review-header">
                                                    <span className="reviewer-name">
                                                        {review.user?.name || review.userName || 'Anonymous'}
                                                    </span>
                                                    <span className="review-date">
                                                        {review.date 
                                                            ? new Date(review.date).toLocaleDateString() 
                                                            : 'Unknown date'
                                                        }
                                                    </span>
                                                </div>
                                                <div className="review-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < (review.rating || 0) ? 'filled' : ''}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="review-comment">{review.comment}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'shipping' && (
                            <div className="tab-panel shipping-panel">
                                <h3>Shipping Information</h3>
                                <ul>
                                    <li>🚚 <strong>Express Shipping:</strong> 3-5 business days worldwide</li>
                                    <li>📦 <strong>Discreet Packaging:</strong> Plain packaging with no product labels</li>
                                    <li>🔒 <strong>Secure Delivery:</strong> Signature required for high-value orders</li>
                                    <li>🌍 <strong>International:</strong> We ship to 40+ countries</li>
                                    <li>✈️ <strong>Tracking:</strong> Full tracking provided via email</li>
                                </ul>
                                
                                <div className="shipping-note">
                                    <strong>Note:</strong> Research chemicals may be subject to customs inspection. 
                                    Customer is responsible for ensuring legal import in their country.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                <RelatedProducts 
                    category={productData.category} 
                    subCategory={productData.subCategory}
                    currentProductId={productData._id || productData.id}
                />
            </div>

            <Footer />
        </div>
    );
};

export default Product;