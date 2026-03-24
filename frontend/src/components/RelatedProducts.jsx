import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import '../styles/RelatedProducts.scss';

const RelatedProducts = ({ category, subCategory, currentProductId }) => {
    const { products, currency, addToCart, cartItems } = useContext(ShopContext);
    const navigate = useNavigate();

    // Get related products based on category/subCategory
    const relatedProducts = useMemo(() => {
        if (!products || products.length === 0) return [];

        // Filter out current product and match by category or subCategory
        const filtered = products.filter(product => {
            if (product._id === currentProductId || product.id === currentProductId) return false;
            
            // Priority: same subCategory > same category > other
            if (subCategory && product.subCategory === subCategory) return true;
            if (product.category === category) return true;
            
            return false;
        });

        // Sort by relevance: bestsellers first, then by rating
        return filtered
            .sort((a, b) => {
                if (a.bestseller && !b.bestseller) return -1;
                if (!a.bestseller && b.bestseller) return 1;
                return (b.rating || 0) - (a.rating || 0);
            })
            .slice(0, 4); // Limit to 4 products
    }, [products, category, subCategory, currentProductId]);

    // Check if product is in cart
    const isInCart = (productId) => {
        return cartItems?.[productId] > 0;
    };

    // Handle quick add to cart
    const handleQuickAdd = (e, product) => {
        e.stopPropagation();
        addToCart(product._id || product.id, 1);
    };

    // Navigate to product
    const goToProduct = (productId) => {
        navigate(`/product/${productId}`);
        window.scrollTo(0, 0);
    };

    if (relatedProducts.length === 0) return null;

    return (
        <section className="related-products">
            <div className="related-header">
                <h2>Related Products</h2>
                <p>You might also be interested in these items</p>
            </div>

            <div className="related-grid">
                {relatedProducts.map((product) => {
                    const productId = product._id || product.id;
                    const inCart = isInCart(productId);
                    const hasDiscount = product.oldPrice && product.oldPrice > product.price;
                    const discountPercent = hasDiscount 
                        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                        : 0;

                    return (
                        <div 
                            key={productId} 
                            className="related-card"
                            onClick={() => goToProduct(productId)}
                        >
                            {/* Image Container */}
                            <div className="related-image-wrapper">
                                <img 
                                    src={product.images?.[0] || product.image?.[0] || '/placeholder-product.png'} 
                                    alt={product.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-product.png';
                                    }}
                                />
                                
                                {/* Badges */}
                                <div className="related-badges">
                                    {product.bestseller && (
                                        <span className="badge bestseller">Best Seller</span>
                                    )}
                                    {hasDiscount && (
                                        <span className="badge discount">-{discountPercent}%</span>
                                    )}
                                    {product.stock < 5 && product.stock > 0 && (
                                        <span className="badge low-stock">Low Stock</span>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="related-actions">
                                    <button 
                                        className={`quick-add-btn ${inCart ? 'in-cart' : ''}`}
                                        onClick={(e) => handleQuickAdd(e, product)}
                                        disabled={product.stock === 0}
                                        aria-label={inCart ? 'Added to cart' : 'Add to cart'}
                                    >
                                        {inCart ? '✓' : '+'}
                                    </button>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="related-info">
                                <span className="related-category">{product.category}</span>
                                <h3 className="related-name">{product.name}</h3>
                                
                                {/* Rating */}
                                {product.rating > 0 && (
                                    <div className="related-rating">
                                        <span className="stars">
                                            {'★'.repeat(Math.round(product.rating))}
                                        </span>
                                        <span className="count">({product.reviews || 0})</span>
                                    </div>
                                )}

                                {/* Price */}
                                <div className="related-price">
                                    <span className="current">{currency}{product.price}</span>
                                    {hasDiscount && (
                                        <span className="old">{currency}{product.oldPrice}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default RelatedProducts;