import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import '../styles/Home.css';

// ==================== REUSABLE COMPONENTS ====================
const ImageWithFallback = ({ src, fallback, alt, className, loading = 'lazy', ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallback) {
      setImgSrc(fallback);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
      {...props}
    />
  );
};

// ==================== STATIC DATA (Pas de hooks ici) ====================
const sliderImages = [
  assets.hero.alexander,
  assets.hero.ambitious,
  assets.hero.karsten,
  assets.hero.victor
];

const stats = [
  { id: 1, value: '10K+', label: 'Satisfied Customers', icon: '👥' },
  { id: 2, value: '99.8%', label: 'Guaranteed Purity', icon: '🎯' },
  { id: 3, value: '48h', label: 'Average Delivery', icon: '🚚' },
  { id: 4, value: '24/7', label: 'Customer Support', icon: '💬' },
];

const features = [
  { 
    id: 1,
    icon: '🧪', 
    title: 'Laboratory Quality', 
    description: 'Products tested and analyzed by HPLC',
    image: assets.features.quality_lab
  },
  { 
    id: 2,
    icon: '📦', 
    title: 'Discrete Shipping', 
    description: 'Neutral packaging & real-time tracking',
    image: assets.features.discrete_shipping
  },
  { 
    id: 3,
    icon: '🔐', 
    title: 'Secure Payment', 
    description: 'SSL encryption and protected payments',
    image: assets.features.secure_payment
  },
  { 
    id: 4,
    icon: '⚠️', 
    title: 'Guaranteed Authenticity', 
    description: 'Analysis certificates available',
    image: assets.features.authenticity
  },
];

const sarmsBenefits = [
  'High muscle tissue selectivity',
  'No conversion to DHT or estrogens',
  'Reduced liver side effects',
  'Easier post-cycle gain maintenance',
  'Accelerated muscle recovery'
];

const newSarms = [
  { 
    id: 1,
    name: 'YK-11', 
    description: 'Myostatin inhibitor - extreme hypertrophy', 
    status: 'New' 
  },
  { 
    id: 2,
    name: 'S-23', 
    description: 'Androgen receptor affinity ×10', 
    status: 'Exclusive' 
  },
  { 
    id: 3,
    name: 'AC-262', 
    description: 'Light alternative to testosterone', 
    status: 'In Stock' 
  },
];

const testimonials = [
  {
    id: 1,
    name: 'Marc Laurent',
    role: 'Professional Bodybuilder',
    text: 'The RAD-140 quality exceeded my expectations. Incredible cutting without strength loss.',
    rating: 5,
    image: assets.testimonials.avatar1
  },
  {
    id: 2,
    name: 'Sophie Renaud',
    role: 'Fitness Coach',
    text: 'Discrete delivery and products matching certificates. Responsive customer service.',
    rating: 5,
    image: assets.testimonials.avatar2
  },
  {
    id: 3,
    name: 'Thomas Garnier',
    role: 'CrossFit Athlete',
    text: 'Their PCT allowed me to recover effectively after my cycle. Recommended.',
    rating: 4,
    image: assets.testimonials.avatar3
  },
];

// SARMs page data
const sarmTypes = [
  {
    id: 'rad140',
    name: 'RAD-140 (Testolone)',
    description: 'The most powerful SARM for strength and mass',
    benefits: [
      'Significant strength increase',
      'Rapid muscle growth',
      'Reduction of body fat',
      'Improved endurance'
    ],
    dosage: '10-20mg/day',
    cycle: '8-12 weeks',
    strength: 9,
    image: assets.sarms_types.RAD_140
  },
  {
    id: 'lgd4033',
    name: 'LGD-4033 (Ligandrol)',
    description: 'Excellent for lean mass gain',
    benefits: [
      'Significant muscle gains',
      'Increased bone density',
      'Low androgenic suppression',
      'Improved recovery'
    ],
    dosage: '5-10mg/day',
    cycle: '8-10 weeks',
    strength: 8,
    image: assets.sarms_types.lgd4033
  },
  {
    id: 'mk677',
    name: 'MK-677 (Ibutamoren)',
    description: 'GH secretagogue for recovery',
    benefits: [
      'Increased growth hormone',
      'Improved sleep',
      'Increased appetite',
      'Accelerated recovery'
    ],
    dosage: '10-25mg/day',
    cycle: 'Long cycle possible',
    strength: 7,
    image: assets.sarms_types.mk677
  },
  {
    id: 'ostarine',
    name: 'Ostarine (MK-2866)',
    description: 'Versatile SARM for beginners',
    benefits: [
      'Excellent for cutting',
      'Muscle preservation',
      'Low side effects',
      'Ideal for beginners'
    ],
    dosage: '15-25mg/day',
    cycle: '8-12 weeks',
    strength: 6,
    image: assets.sarms_types.MK_2866
  },
  {
    id: 'yk11',
    name: 'YK-11',
    description: 'Myostatin inhibitor - extreme gains',
    benefits: [
      'Myostatin inhibition',
      'Muscle hyperplasia',
      'Exceptional mass gains',
      'Increased density'
    ],
    dosage: '5-10mg/day',
    cycle: '6-8 weeks',
    strength: 10,
    image: assets.sarms_types.YK_11
  },
  {
    id: 's23',
    name: 'S-23',
    description: 'Powerful androgenic SARM',
    benefits: [
      'High receptor affinity',
      'Maximum vascularization',
      'Extreme cutting',
      'Explosive strength'
    ],
    dosage: '10-20mg/day',
    cycle: '6-8 weeks',
    strength: 9,
    image: assets.sarms_types.s23
  }
];

const cycles = [
  {
    name: 'Beginner Cycle',
    duration: '8 weeks',
    sarm: 'Ostarine 20mg/day',
    pct: 'Light (4 weeks)',
    results: '+3-4kg muscle, -2-3% fat',
    notes: 'Ideal for first experience'
  },
  {
    name: 'Bulking Cycle',
    duration: '12 weeks',
    sarm: 'LGD-4033 10mg + RAD-140 10mg',
    pct: 'Standard (6 weeks)',
    results: '+6-8kg muscle, strength ×2',
    notes: 'Classic stack for mass'
  },
  {
    name: 'Cutting Cycle',
    duration: '10 weeks',
    sarm: 'Ostarine 25mg + Cardarine 20mg',
    pct: 'Standard (4 weeks)',
    results: '-5-7% fat, definition',
    notes: 'Maximum muscle preservation'
  },
  {
    name: 'Advanced Cycle',
    duration: '10 weeks',
    sarm: 'YK-11 10mg + S-23 15mg',
    pct: 'Aggressive (8 weeks)',
    results: '+8-10kg muscle, extreme strength',
    notes: 'Reserved for experienced users'
  }
];

const faqItems = [
  {
    question: 'Are SARMs legal?',
    answer: 'Yes, SARMs are legal for scientific research and personal use in most countries. They are not approved by the FDA for human consumption.'
  },
  {
    question: 'What is the difference with steroids?',
    answer: 'SARMs are selective for muscle and bone tissues, while steroids affect the entire body. Fewer liver side effects and no conversion to estrogens.'
  },
  {
    question: 'Is PCT needed after a cycle?',
    answer: 'Yes, even though suppression is less than with steroids, a PCT of 4-8 weeks is recommended depending on cycle duration and dosage.'
  },
  {
    question: 'When do you see first results?',
    answer: 'First effects are felt from week 2 (strength increase). Visible changes appear between week 4 and 6.'
  },
  {
    question: 'Can you combine multiple SARMs?',
    answer: 'Yes, this is called a "stack". Dosages must be respected and complementary SARMs chosen. Avoid combining too powerful SARMs.'
  },
  {
    question: 'Are there anti-doping tests?',
    answer: 'Most SARMs are not detected in standard anti-doping tests, but specific tests can detect them. Always check according to your sports federation.'
  }
];

const tableOfContents = [
  { id: 'what-are-sarms', title: 'What are SARMs?', icon: '❓' },
  { id: 'mechanism', title: 'Mechanism of Action', icon: '⚙️' },
  { id: 'benefits', title: 'Benefits vs Steroids', icon: '✅' },
  { id: 'types', title: 'Types of SARMs', icon: '📊' },
  { id: 'results', title: 'Expected Results', icon: '📈' },
  { id: 'cycles', title: 'Cycles & Dosages', icon: '🔄' },
  { id: 'side-effects', title: 'Side Effects', icon: '⚠️' },
  { id: 'pct', title: 'Required PCT', icon: '🛡️' },
  { id: 'legal-status', title: 'Legal Status', icon: '⚖️' },
  { id: 'faq', title: 'FAQ', icon: '💬' },
];

// Category data with icons and descriptions
const categoryData = {
  'SARMs': { 
    icon: '⚡', 
    description: 'Ostarine • RAD-140 • LGD-4033',
    color: '#FFD700'
  },
  'Orals': { 
    icon: '💊', 
    description: 'Anavar • Dianabol • Winstrol',
    color: '#FF6B6B'
  },
  'Injectables': { 
    icon: '💉', 
    description: 'Testosterone • Trenbolone • Masteron',
    color: '#4ECDC4'
  },
  'PCT': { 
    icon: '🛡️', 
    description: 'Clomid • Nolvadex • Aromasin',
    color: '#95E1D3'
  },
  'Peptides': { 
    icon: '🧬', 
    description: 'HGH • BPC-157 • CJC-1295',
    color: '#F38181'
  }
};

// Fallback images using existing assets
const fallbackImages = {
  hero: assets.hero.alexander,
  feature: assets.features.quality_lab,
  product: assets.sarms_types.RAD_140,
  avatar: assets.testimonials.avatar1,
  sarmComparison: assets.sarms_guide.SARMs
};

// ==================== MAIN COMPONENT ====================
export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [showSarmsInfo, setShowSarmsInfo] = useState(false);
  const faqRefs = useRef([]);

  // ==========================================
  // HOOKS CONTEXT - TOUJOURS DANS LE COMPOSANT
  // ==========================================
  
  // Get bestsellers from ShopContext
  const { 
    getBestsellers, 
    getFilteredProducts, 
    categories: shopCategories, 
    setSelectedCategory,
    products 
  } = useContext(ShopContext);

  const bestsellers = getBestsellers();

  // Get category counts dynamically
  const getCategoryCounts = () => {
    const counts = {};
    shopCategories.forEach(cat => {
      if (cat !== 'All') {
        counts[cat] = products.filter(p => p.category === cat).length;
      }
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  // ==================== EFFECTS ====================
  // Hero slider auto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll detection for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll reveal with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    document.querySelectorAll('[data-observe]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Table of contents auto-scroll
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Lazy loading for images
  useEffect(() => {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => imageObserver.observe(img));
    
    return () => imageObserver.disconnect();
  }, []);

  // ==================== HANDLERS ====================
  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const toggleSarmsInfo = () => {
    setShowSarmsInfo(!showSarmsInfo);
    if (!showSarmsInfo) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    navigate('/shop');
  };

  // ==================== RENDER ====================
  return (
    <div className="home">
      {/* HERO SECTION */}
      <section className={`hero-section ${showSarmsInfo ? 'sarms-hero-mode' : ''}`}>
        <div className="hero-slider">
          {sliderImages.map((image, index) => (
            <div 
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <ImageWithFallback
                src={image}
                fallback={fallbackImages.hero}
                alt={`Hero ${index + 1}`}
                className="hero-image"
                loading="eager"
              />
            </div>
          ))}
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content" data-observe data-id="hero-content">
          <div className="container">
            {showSarmsInfo ? (
              <>
                <div className="hero-badge">COMPLETE GUIDE</div>
                <h1 className="hero-title">
                  Ultimate <span className="hero-title-gradient">SARMs</span> Guide
                </h1>
                <p className="hero-description">
                  Everything you need to know about SARMs: mechanism of action, benefits, cycles, 
                  side effects and optimized protocols. Based on scientific research.
                </p>
                
                <div className="sarms-hero-stats">
                  <div className="stat-item">
                    <span className="stat-value">+95%</span>
                    <span className="stat-label">Muscle Selectivity</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">-80%</span>
                    <span className="stat-label">Side effects vs steroids</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">6-12</span>
                    <span className="stat-label">Week cycle duration</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">200+</span>
                    <span className="stat-label">Scientific studies</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="hero-title">
                  <span className="hero-title-gradient">Performance</span>
                  <br />
                  Extreme. Scientific Results.
                </h1>
                <p className="hero-description">
                  Next-generation SARMs, pharmaceutical steroids and advanced 
                  protocols to transform your physique.
                </p>
                
                <div className="hero-stats">
                  {stats.map((stat) => (
                    <div key={stat.id} className="stat-item">
                      <span className="stat-icon">{stat.icon}</span>
                      <span className="stat-value">{stat.value}</span>
                      <span className="stat-label">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary btn-glow">
                <span className="btn-icon">🔥</span>
                Explore Products
              </Link>
              <button 
                onClick={toggleSarmsInfo}
                className="btn btn-outline"
              >
                <span className="btn-icon">📖</span>
                {showSarmsInfo ? 'Back to Home' : 'SARMs Guide'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN SECTIONS */}
      <div className={`home-sections ${showSarmsInfo ? 'hidden' : ''}`}>
        {/* FEATURES SECTION */}
        <section className="features-section section-padding">
          <div className="container">
            <div className="section-header" data-observe data-id="features-header">
              <h2 className="section-title">
                Scientific <span className="text-gradient">Excellence</span>
              </h2>
              <p className="section-subtitle">
                Tested products and maximum safety for your transformation
              </p>
            </div>

            <div className="features-grid">
              {features.map((feature, index) => (
                <div 
                  key={feature.id}
                  className="feature-card"
                  data-observe
                  data-id={`feature-${feature.id}`}
                  style={{ '--delay': `${index * 100}ms` }}
                >
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">{feature.icon}</span>
                  </div>
                  
                  <div className="feature-image-wrapper">
                    <ImageWithFallback
                      src={feature.image}
                      fallback={fallbackImages.feature}
                      alt={feature.title}
                      className="feature-image"
                      loading="lazy"
                    />
                    <div className="feature-overlay"></div>
                  </div>
                  
                  <div className="feature-content">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                  
                  <div className="feature-shine"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SARMS INFO SECTION */}
        <section className="sarms-section section-padding">
          <div className="container">
            <div className="sarms-grid">
              <div className="sarms-benefits" data-observe data-id="sarms-benefits">
                <div className="section-header">
                  <h2 className="section-title">
                    Why <span className="text-gradient">SARMs</span>
                  </h2>
                  <p className="section-subtitle">
                    The revolution of targeted performance
                  </p>
                </div>
                
                <ul className="benefits-list">
                  {sarmsBenefits.map((benefit, index) => (
                    <li 
                      key={index}
                      className="benefit-item"
                      data-observe
                      data-id={`benefit-${index}`}
                    >
                      <div className="benefit-icon">✓</div>
                      <span className="benefit-text">{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="sarms-actions">
                  <button 
                    onClick={toggleSarmsInfo}
                    className="btn btn-outline"
                  >
                    SARMs vs Steroids Comparison
                  </button>
                  <Link to="/Research" className="btn btn-text">
                    View studies →
                  </Link>
                </div>
              </div>

              <div className="sarms-innovations" data-observe data-id="sarms-innovations">
                <div className="innovations-header">
                  <h3>Exclusive Innovations</h3>
                  <span className="innovations-badge">New</span>
                </div>
                
                <div className="innovations-list">
                  {newSarms.map((sarm) => (
                    <div 
                      key={sarm.id}
                      className="innovation-item"
                      data-observe
                      data-id={`innovation-${sarm.id}`}
                    >
                      <div className="innovation-header">
                        <h4 className="innovation-name">{sarm.name}</h4>
                        <span className={`innovation-status status-${sarm.status.toLowerCase().replace(' ', '-')}`}>
                          {sarm.status}
                        </span>
                      </div>
                      <p className="innovation-description">{sarm.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="lab-certification" data-observe>
                  <div className="lab-certification-content">
                    <div className="lab-icon">🧪</div>
                    <div className="lab-info">
                      <h4>HPLC Certification</h4>
                      <p>Independent analysis of each batch</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION - Dynamic with ShopContext */}
        <section className="categories-section section-padding">
          <div className="container">
            <div className="section-header" data-observe data-id="categories-header">
              <h2 className="section-title">
                Browse by <span className="text-gradient">Category</span>
              </h2>
              <p className="section-subtitle">
                Specialized products for every goal
              </p>
            </div>

            <div className="categories-grid">
              {shopCategories && shopCategories.filter(cat => cat !== 'All').map((category, index) => {
                const data = categoryData[category] || { icon: '📦', description: 'Quality products', color: '#FFD700' };
                const count = categoryCounts[category] || 0;
                
                return (
                  <button 
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className="category-card"
                    data-observe
                    data-id={`category-${category}`}
                    style={{ 
                      '--delay': `${index * 100}ms`,
                      '--category-color': data.color 
                    }}
                  >
                    <div className="category-icon" style={{ color: data.color }}>
                      {data.icon}
                    </div>
                    <div className="category-content">
                      <h3 className="category-title">{category}</h3>
                      <p className="category-description">{data.description}</p>
                      <div className="category-meta">
                        <span className="category-count">{count} products</span>
                        <span className="category-arrow">→</span>
                      </div>
                    </div>
                    <div className="category-glow" style={{ background: data.color }}></div>
                  </button>
                );
              })}
            </div>

            <div className="categories-footer" data-observe>
              <Link to="/shop" className="btn btn-primary">
                View All Products
              </Link>
            </div>
          </div>
        </section>

        {/* BEST SELLERS SECTION - Using ShopContext Data */}
        <section className="products-section section-padding">
          <div className="container">
            <div className="section-header" data-observe data-id="products-header">
              <h2 className="section-title">
                <span className="text-gradient">Best-Sellers</span>
              </h2>
              <p className="section-subtitle">
                Our customers' most acclaimed products
              </p>
            </div>

            <div className="products-grid">
              {bestsellers && bestsellers.length > 0 ? (
                bestsellers.map((product, index) => (
                  <div 
                    key={product._id}
                    className="product-card-wrapper"
                    data-observe
                    data-id={`product-${product._id}`}
                    style={{ '--delay': `${index * 150}ms` }}
                  >
                    <ProductItem 
                      id={product._id}
                      image={product.image}
                      name={product.name}
                      price={product.price}
                    />
                  </div>
                ))
              ) : (
                <div className="no-products">
                  <p>No bestsellers available at the moment.</p>
                </div>
              )}
            </div>

            <div className="products-footer" data-observe>
              <Link to="/shop" className="btn btn-primary">
                View All Products
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="testimonials-section section-padding">
          <div className="container">
            <div className="section-header" data-observe data-id="testimonials-header">
              <h2 className="section-title">
                Customer <span className="text-gradient">Reviews</span>
              </h2>
              <p className="section-subtitle">
                What our satisfied athletes say
              </p>
            </div>

            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id}
                  className="testimonial-card"
                  data-observe
                  data-id={`testimonial-${testimonial.id}`}
                  style={{ '--delay': `${index * 100}ms` }}
                >
                  <div className="testimonial-header">
                    <div className="testimonial-avatar">
                      <ImageWithFallback
                        src={testimonial.image}
                        fallback={fallbackImages.avatar}
                        alt={testimonial.name}
                      />
                    </div>
                    <div className="testimonial-info">
                      <h4 className="testimonial-name">{testimonial.name}</h4>
                      <p className="testimonial-role">{testimonial.role}</p>
                    </div>
                    <div className="testimonial-rating">
                      {'★'.repeat(testimonial.rating)}
                    </div>
                  </div>
                  
                  <blockquote className="testimonial-text">
                    "{testimonial.text}"
                  </blockquote>
                  
                  <div className="testimonial-verified">
                    <span className="verified-icon">✓</span>
                    Verified Purchase
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* SARMs GUIDE SECTIONS */}
      <div className={`sarms-sections ${showSarmsInfo ? '' : 'hidden'}`}>
        {/* TABLE OF CONTENTS */}
        <section className="toc-section section-padding" id="table-of-contents">
          <div className="container">
            <h2 className="toc-title">📑 Table of Contents</h2>
            <div className="toc-grid">
              {tableOfContents.map((item, index) => (
                <a 
                  key={item.id}
                  href={`#${item.id}`}
                  className="toc-item"
                  style={{ '--delay': `${index * 50}ms` }}
                >
                  <span className="toc-icon">{item.icon}</span>
                  <span className="toc-text">{item.title}</span>
                  <span className="toc-arrow">→</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT ARE SARMS */}
        <section className="info-section section-padding" id="what-are-sarms">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">INTRODUCTION</span>
              <h2 className="section-title">
                What are <span className="text-gradient">SARMs</span>?
              </h2>
            </div>
            
            <div className="content-grid">
              <div className="content-text">
                <p>
                  <strong>SARMs (Selective Androgen Receptor Modulators)</strong> are a class 
                  of therapeutic compounds that have similar effects to anabolic steroids, 
                  but with improved tissue selectivity and fewer side effects.
                </p>
                
                <div className="definition-card">
                  <h3>Scientific Definition</h3>
                  <p>
                    SARMs are ligands that selectively bind to androgen receptors (AR) 
                    in target tissues (muscles, bones) while having reduced affinity for 
                    non-target tissues (prostate, liver, skin).
                  </p>
                </div>
                
                <h3>Development History</h3>
                <ul className="timeline">
                  <li><strong>1998</strong> - Discovery of first SARM-like compounds</li>
                  <li><strong>2003</strong> - Publication of first preclinical studies</li>
                  <li><strong>2007</strong> - Phase I clinical trials for osteoporosis</li>
                  <li><strong>2012</strong> - Popularization in the fitness community</li>
                  <li><strong>2020</strong> - New generation of SARMs (YK-11, S-23)</li>
                </ul>
              </div>
              
              <div className="content-image">
                <ImageWithFallback
                  src={fallbackImages.sarmComparison}
                  fallback={fallbackImages.feature}
                  alt="SARMs vs Steroids Comparison"
                  loading="lazy"
                />
                <div className="image-caption">
                  Structural comparison: SARMs (selective) vs Steroids (systemic)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MECHANISM OF ACTION */}
        <section className="info-section dark-section section-padding" id="mechanism">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">SCIENCE</span>
              <h2 className="section-title">
                Mechanism of <span className="text-gradient">Action</span>
              </h2>
            </div>
            
            <div className="mechanism-grid">
              <div className="mechanism-step">
                <div className="step-number">1</div>
                <h3>Selective Binding</h3>
                <p>
                  SARMs specifically bind to androgen receptors in muscle and bone tissues, 
                  thus avoiding non-target tissues.
                </p>
              </div>
              
              <div className="mechanism-step">
                <div className="step-number">2</div>
                <h3>Transcriptional Activation</h3>
                <p>
                  Activation of gene transcription responsible for protein synthesis and 
                  cell growth in myocytes (muscle cells).
                </p>
              </div>
              
              <div className="mechanism-step">
                <div className="step-number">3</div>
                <h3>Myostatin Inhibition</h3>
                <p>
                  Some SARMs (like YK-11) inhibit myostatin, a protein that limits muscle 
                  growth, allowing increased hypertrophy.
                </p>
              </div>
              
              <div className="mechanism-step">
                <div className="step-number">4</div>
                <h3>GH/IGF-1 Increase</h3>
                <p>
                  Indirect stimulation of growth hormone and IGF-1 production, improving 
                  recovery and muscle growth.
                </p>
              </div>
            </div>
            
            <div className="science-note">
              <div className="science-icon">🔬</div>
              <div className="science-text">
                <h4>Scientific Note</h4>
                <p>
                  SARMs have a binding affinity 10 to 100 times higher for muscle receptors 
                  than for prostate receptors, explaining their selectivity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS VS STEROIDS */}
        <section className="info-section section-padding" id="benefits">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">COMPARISON</span>
              <h2 className="section-title">
                <span className="text-gradient">SARMs</span> Benefits vs Steroids
              </h2>
              <p className="section-description">
                Why choose SARMs over traditional steroids?
              </p>
            </div>
            
            <div className="comparison-grid">
              <div className="comparison-card sarms-card">
                <div className="comparison-header">
                  <h3>SARMs</h3>
                  <p className="comparison-subtitle">Tissue selectivity</p>
                </div>
                <div className="comparison-list">
                  <div className="comparison-item">
                    <div className="comparison-icon">✓</div>
                    <div className="comparison-text">Specific targeting of muscles and bones</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-icon">✓</div>
                    <div className="comparison-text">No conversion to estrogens</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-icon">✓</div>
                    <div className="comparison-text">Reduced liver effects</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-icon">✓</div>
                    <div className="comparison-text">Moderate androgenic suppression</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-icon">✓</div>
                    <div className="comparison-text">Simplified PCT</div>
                  </div>
                </div>
              </div>
              
              <div className="comparison-card">
                <div className="comparison-header">
                  <h3>Steroids</h3>
                  <p className="comparison-subtitle">Systemic effects</p>
                </div>
                <div className="comparison-list">
                  <div className="comparison-item">
                    <div className="comparison-icon">✗</div>
                    <div className="comparison-text">Effects on entire body</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-icon">✗</div>
                    <div className="comparison-text">Conversion to estrogens (aromatization)</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-icon">✗</div>
                    <div className="comparison-text">High liver toxicity (orals)</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-icon">✗</div>
                    <div className="comparison-text">Severe androgenic suppression</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-icon">✗</div>
                    <div className="comparison-text">Long and complex PCT</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="comparison-summary">
              <p>
                <strong>Conclusion:</strong> SARMs offer a superior safety profile with targeted 
                effects on muscle and bone tissues, while significantly reducing the undesirable 
                side effects typical of steroids.
              </p>
            </div>
          </div>
        </section>

        {/* TYPES OF SARMS */}
        <section className="info-section dark-section section-padding" id="types">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">CATALOG</span>
              <h2 className="section-title">
                Types of <span className="text-gradient">SARMs</span>
              </h2>
              <p className="section-description">
                Complete overview of main available SARMs with their specificities
              </p>
            </div>
            
            <div className="sarms-types-grid">
              {sarmTypes.map((sarm) => (
                <div key={sarm.id} className="sarm-type-card">
                  <div className="sarm-header">
                    <h3 className="sarm-name">{sarm.name}</h3>
                    <div className="sarm-strength">
                      <div className="strength-label">Strength</div>
                      <div className="strength-bar">
                        <div 
                          className="strength-fill"
                          style={{ width: `${sarm.strength * 10}%` }}
                        ></div>
                      </div>
                      <div className="strength-value">{sarm.strength}/10</div>
                    </div>
                  </div>
                  
                  <div className="sarm-image-wrapper">
                    <ImageWithFallback
                      src={sarm.image}
                      fallback={fallbackImages.product}
                      alt={sarm.name}
                      className="sarm-image"
                      loading="lazy"
                    />
                  </div>
                  
                  <p className="sarm-description">{sarm.description}</p>
                  
                  <div className="sarm-benefits">
                    <h4>Main Benefits</h4>
                    <ul>
                      {sarm.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="sarm-dosage">
                    <div className="dosage-info">
                      <span className="dosage-label">Recommended Dosage</span>
                      <span className="dosage-value">{sarm.dosage}</span>
                    </div>
                    <div className="cycle-info">
                      <span className="cycle-label">Cycle Duration</span>
                      <span className="cycle-value">{sarm.cycle}</span>
                    </div>
                  </div>
                  
                  <Link to={`/shop`} className="sarm-details-btn">
                    View product →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RESULTS SECTION */}
        <section className="info-section section-padding" id="results">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">PERFORMANCE</span>
              <h2 className="section-title">
                Expected <span className="text-gradient">Results</span>
              </h2>
              <p className="section-description">
                What you can expect with proper SARMs use
              </p>
            </div>
            
            <div className="results-cards">
              <div className="result-card">
                <div className="result-icon">💪</div>
                <div className="result-value">+15-25%</div>
                <div className="result-label">Strength Increase</div>
                <div className="result-note">In 4-6 weeks</div>
              </div>
              
              <div className="result-card">
                <div className="result-icon">🏋️</div>
                <div className="result-value">+3-8kg</div>
                <div className="result-label">Lean Muscle Mass</div>
                <div className="result-note">In 8-12 weeks</div>
              </div>
              
              <div className="result-card">
                <div className="result-icon">🔥</div>
                <div className="result-value">-3-8%</div>
                <div className="result-label">Body Fat</div>
                <div className="result-note">With cutting SARMs</div>
              </div>
              
              <div className="result-card">
                <div className="result-icon">⚡</div>
                <div className="result-value">+20-40%</div>
                <div className="result-label">Endurance</div>
                <div className="result-note">Improved performance</div>
              </div>
            </div>
            
            <div className="results-timeline">
              <h3>Results Timeline</h3>
              <div className="timeline-steps">
                <div className="timeline-step">
                  <div className="step-time">Week 1-2</div>
                  <div className="step-title">Adaptation</div>
                  <div className="step-description">Increased energy and motivation</div>
                </div>
                <div className="timeline-step">
                  <div className="step-time">Week 3-4</div>
                  <div className="step-title">Strength</div>
                  <div className="step-description">Notable strength increase in exercises</div>
                </div>
                <div className="timeline-step">
                  <div className="step-time">Week 5-8</div>
                  <div className="step-title">Growth</div>
                  <div className="step-description">Visible muscle gains, better definition</div>
                </div>
                <div className="timeline-step">
                  <div className="step-time">Week 9-12</div>
                  <div className="step-title">Consolidation</div>
                  <div className="step-description">Gain maximization, optimal recovery</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CYCLES SECTION */}
        <section className="info-section dark-section section-padding" id="cycles">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">PROTOCOLS</span>
              <h2 className="section-title">
                Cycles & <span className="text-gradient">Dosages</span>
              </h2>
              <p className="section-description">
                Optimized protocols according to experience and goals
              </p>
            </div>
            
            <div className="cycles-table">
              <table>
                <thead>
                  <tr>
                    <th>Cycle</th>
                    <th>Duration</th>
                    <th>SARMs</th>
                    <th>PCT</th>
                    <th>Results</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map((cycle, index) => (
                    <tr key={index}>
                      <td>{cycle.name}</td>
                      <td>{cycle.duration}</td>
                      <td>{cycle.sarm}</td>
                      <td>{cycle.pct}</td>
                      <td>{cycle.results}</td>
                      <td>{cycle.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="cycle-recommendations">
              <h3>Important Recommendations</h3>
              <div className="recommendations-grid">
                <div className="recommendation">
                  <div className="recommendation-icon">⚠️</div>
                  <div className="recommendation-text">
                    <strong>Never exceed recommended doses</strong>
                    <p>Strictly respect dosages to avoid side effects</p>
                  </div>
                </div>
                <div className="recommendation">
                  <div className="recommendation-icon">⏱️</div>
                  <div className="recommendation-text">
                    <strong>Respect cycle duration</strong>
                    <p>Cycles that are too long increase suppression risk</p>
                  </div>
                </div>
                <div className="recommendation">
                  <div className="recommendation-icon">🧪</div>
                  <div className="recommendation-text">
                    <strong>Get blood tests</strong>
                    <p>Before, during and after cycle to monitor health</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SIDE EFFECTS SECTION */}
        <section className="info-section section-padding" id="side-effects">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">SAFETY</span>
              <h2 className="section-title">
                Side <span className="text-gradient">Effects</span>
              </h2>
              <p className="section-description">
                Understanding and managing potential adverse effects
              </p>
            </div>
            
            <div className="side-effects-grid">
              <div className="side-effect-card warning">
                <div className="side-effect-icon">⚠️</div>
                <div className="side-effect-title">Androgenic Suppression</div>
                <ul className="side-effect-list">
                  <li>Decreased libido</li>
                  <li>Fatigue and energy loss</li>
                  <li>Decreased natural testosterone</li>
                </ul>
                <div className="side-effect-severity">
                  <div className="severity-label">Severity:</div>
                  <div className="severity-badge moderate">Moderate</div>
                </div>
              </div>
              
              <div className="side-effect-card info">
                <div className="side-effect-icon">💊</div>
                <div className="side-effect-title">Liver Effects</div>
                <ul className="side-effect-list">
                  <li>Increased liver enzymes</li>
                  <li>Less pronounced than with oral steroids</li>
                  <li>Reversible upon stopping</li>
                </ul>
                <div className="side-effect-severity">
                  <div className="severity-label">Severity:</div>
                  <div className="severity-badge low">Low</div>
                </div>
              </div>
              
              <div className="side-effect-card">
                <div className="side-effect-icon">💤</div>
                <div className="side-effect-title">Other Possible Effects</div>
                <ul className="side-effect-list">
                  <li>Mild headaches</li>
                  <li>Insomnia (with some SARMs)</li>
                  <li>Minimal water retention</li>
                  <li>Acne (rare and mild)</li>
                </ul>
                <div className="side-effect-severity">
                  <div className="severity-label">Severity:</div>
                  <div className="severity-badge low">Low</div>
                </div>
              </div>
            </div>
            
            <div className="side-effects-management">
              <h3>Side Effects Management</h3>
              <div className="management-tips">
                <div className="tip">
                  <div className="tip-icon">💧</div>
                  <div className="tip-content">
                    <h4>Hydration</h4>
                    <p>Drink at least 3L of water per day to support liver functions</p>
                  </div>
                </div>
                <div className="tip">
                  <div className="tip-icon">🥦</div>
                  <div className="tip-content">
                    <h4>Nutrition</h4>
                    <p>Diet rich in antioxidants and hepatoprotective nutrients</p>
                  </div>
                </div>
                <div className="tip">
                  <div className="tip-icon">💤</div>
                  <div className="tip-content">
                    <h4>Sleep</h4>
                    <p>Minimum 7-8h of sleep to optimize recovery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PCT SECTION */}
        <section className="info-section dark-section section-padding" id="pct">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">RECOVERY</span>
              <h2 className="section-title">
                <span className="text-gradient">PCT</span> (Post Cycle Therapy)
              </h2>
              <p className="section-description">
                Recovery protocols to restore hormonal function
              </p>
            </div>
            
            <div className="pct-protocols">
              <div className="pct-protocol">
                <div className="pct-header">
                  <h3>Light PCT</h3>
                  <div className="pct-duration">4 weeks</div>
                </div>
                <div className="pct-drugs">
                  <div className="pct-drug">
                    <div className="drug-name">Nolvadex (Tamoxifen)</div>
                    <div className="drug-dosage">20mg/day</div>
                  </div>
                </div>
                <div className="pct-notes">
                  For short cycles (≤8 weeks) with light SARMs like Ostarine
                </div>
              </div>
              
              <div className="pct-protocol">
                <div className="pct-header">
                  <h3>Standard PCT</h3>
                  <div className="pct-duration">6 weeks</div>
                </div>
                <div className="pct-drugs">
                  <div className="pct-drug">
                    <div className="drug-name">Clomid (Clomiphene)</div>
                    <div className="drug-dosage">50mg/day</div>
                  </div>
                  <div className="pct-drug">
                    <div className="drug-name">Nolvadex</div>
                    <div className="drug-dosage">20mg/day</div>
                  </div>
                </div>
                <div className="pct-notes">
                  For medium cycles with RAD-140 or LGD-4033. Reduce gradually.
                </div>
              </div>
              
              <div className="pct-protocol">
                <div className="pct-header">
                  <h3>Aggressive PCT</h3>
                  <div className="pct-duration">8 weeks</div>
                </div>
                <div className="pct-drugs">
                  <div className="pct-drug">
                    <div className="drug-name">Clomid</div>
                    <div className="drug-dosage">100mg → 50mg → 25mg</div>
                  </div>
                  <div className="pct-drug">
                    <div className="drug-name">Nolvadex</div>
                    <div className="drug-dosage">40mg → 20mg</div>
                  </div>
                  <div className="pct-drug">
                    <div className="drug-name">Aromasin</div>
                    <div className="drug-dosage">12.5mg E3D</div>
                  </div>
                </div>
                <div className="pct-notes">
                  For powerful stacks or long cycles with severe suppression
                </div>
              </div>
            </div>
            
            <div className="pct-importance">
              <div className="pct-importance-content">
                <div className="pct-importance-icon">🛡️</div>
                <div className="pct-importance-text">
                  <h3>Importance of PCT</h3>
                  <p>
                    A properly conducted PCT is essential to restore hormonal function, 
                    preserve muscle gains, avoid post-cycle depression and maintain 
                    optimal long-term health.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LEGAL STATUS SECTION */}
        <section className="info-section section-padding" id="legal-status">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">LEGISLATION</span>
              <h2 className="section-title">
                Legal <span className="text-gradient">Status</span>
              </h2>
              <p className="section-description">
                Legal situation of SARMs worldwide
              </p>
            </div>
            
            <div className="legal-grid">
              <div className="legal-info">
                <div className="legal-status">
                  <div className="status-icon">⚖️</div>
                  <div className="status-text">
                    <h4>General Status</h4>
                    <p>
                      SARMs are not approved by the FDA for human consumption. 
                      They are sold only for scientific research and must be 
                      used within research protocols.
                    </p>
                  </div>
                </div>
                
                <div className="legal-warning">
                  <h4>Important</h4>
                  <ul>
                    <li>Sale prohibited as dietary supplement</li>
                    <li>Prohibited in sports competitions (WADA)</li>
                    <li>Personal use generally tolerated</li>
                    <li>User responsibility</li>
                  </ul>
                </div>
              </div>
              
              <div className="country-list">
                <h3>Status by Country</h3>
                <div className="country-item">
                  <div className="country-name">United States</div>
                  <div className="country-status legal">Legal (research)</div>
                </div>
                <div className="country-item">
                  <div className="country-name">Canada</div>
                  <div className="country-status restricted">Restricted</div>
                </div>
                <div className="country-item">
                  <div className="country-name">United Kingdom</div>
                  <div className="country-status legal">Legal (research)</div>
                </div>
                <div className="country-item">
                  <div className="country-name">Australia</div>
                  <div className="country-status illegal">Illegal</div>
                </div>
                <div className="country-item">
                  <div className="country-name">France</div>
                  <div className="country-status restricted">Restricted</div>
                </div>
                <div className="country-item">
                  <div className="country-name">Germany</div>
                  <div className="country-status legal">Legal (research)</div>
                </div>
              </div>
            </div>
            
            <div className="legal-disclaimer">
              <p>
                <strong>Legal Disclaimer:</strong> Information provided is for educational purposes only. 
                It is your responsibility to verify current legislation in your country. 
                We neither recommend nor encourage the use of SARMs outside of scientific research.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="info-section dark-section section-padding" id="faq">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">FREQUENTLY ASKED QUESTIONS</span>
              <h2 className="section-title">
                SARMs <span className="text-gradient">FAQ</span>
              </h2>
            </div>
            
            <div className="faq-grid">
              {faqItems.map((item, index) => (
                <div 
                  key={index} 
                  className={`faq-item ${activeFaq === index ? 'active' : ''}`}
                  ref={el => faqRefs.current[index] = el}
                >
                  <div 
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                  >
                    <h3>{item.question}</h3>
                    <button className="faq-toggle">
                      {activeFaq === index ? '−' : '+'}
                    </button>
                  </div>
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="faq-cta">
              <h3>Additional questions?</h3>
              <p>
                Our team of experts is available to answer all your questions 
                about SARMs and guide you through your journey.
              </p>
              <div className="faq-actions">
                <Link to="/contact" className="btn btn-primary btn-lg">
                  Contact an expert
                </Link>
                <Link to="/research" className="btn btn-outline btn-lg">
                  View studies
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* CTA SECTION */}
      <section className="cta-section section-padding">
        <div className="container">
          <div className="cta-content" data-observe data-id="cta-content">
            <h2 className="cta-title">
              Ready to transform<br />
              your <span className="text-gradient">performance</span>?
            </h2>
            <p className="cta-description">
              Join thousands of athletes who trust our expertise
            </p>
            <div className="cta-actions">
              <Link to="/shop" className="btn btn-primary btn-lg btn-glow">
                Start now
              </Link>
              <Link to="/Consultation" className="btn btn-outline btn-lg">
                Free consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DISCLAIMER SECTION */}
      <section className="disclaimer-section">
        <div className="container">
          <div className="disclaimer-content">
            <div className="disclaimer-icon">⚠️</div>
            <div className="disclaimer-text">
              <h4>Important: For research use only</h4>
              <p>
                Products presented are intended exclusively for scientific research 
                and educational purposes. They are not intended for human consumption, 
                diagnosis, treatment or prevention of disease. Always consult 
                a qualified health professional before undertaking any program.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}