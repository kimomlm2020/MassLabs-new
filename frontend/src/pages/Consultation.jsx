import React, { useState } from 'react';
import '../styles/Consultation.css';

const Consultation = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    goals: '',
    products: [],
    questions: ''
  });

  const experienceLevels = [
    'Beginner (first cycle)',
    'Intermediate (1-3 cycles)',
    'Advanced (more than 3 cycles)',
    'Professional'
  ];

  const productInterests = [
    'SARMs',
    'Oral Steroids',
    'Injectables',
    'PCT',
    'Liver Support',
    'Fat Loss'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would add the form submission logic
    console.log('Form submitted:', formData);
    alert('Consultation request sent! We will contact you within 24 hours.');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        products: checked 
          ? [...prev.products, value]
          : prev.products.filter(p => p !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="consultation-page">
      {/* Hero Section */}
      <section className="consultation-hero">
        <div className="container">
          <div className="hero-badge">EXPERTISE</div>
          <h1>Free Consultation</h1>
          <p className="hero-subtitle">
            Personalized program with our certified experts
          </p>
          
          <div className="hero-benefits">
            <div className="benefit">
              <div className="benefit-icon">🎯</div>
              <div className="benefit-text">Custom plan</div>
            </div>
            <div className="benefit">
              <div className="benefit-icon">⚕️</div>
              <div className="benefit-text">Safety advice</div>
            </div>
            <div className="benefit">
              <div className="benefit-icon">📊</div>
              <div className="benefit-text">Personalized follow-up</div>
            </div>
            <div className="benefit">
              <div className="benefit-icon">🤝</div>
              <div className="benefit-text">Continuous support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Form */}
      <section className="consultation-form-section section-padding">
        <div className="container">
          <div className="form-wrapper">
            <div className="form-intro">
              <h2>Consultation Request</h2>
              <p>
                Fill out this form to receive a free consultation with one of our experts.
                We will contact you within 24 hours to discuss your personalized program.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="consultation-form">
              {/* Personal Information */}
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your first and last name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Experience and Goals */}
              <div className="form-section">
                <h3>Your Profile</h3>
                
                <div className="form-group">
                  <label>Experience Level *</label>
                  <div className="radio-group">
                    {experienceLevels.map((level, index) => (
                      <label key={index} className="radio-label">
                        <input
                          type="radio"
                          name="experience"
                          value={level}
                          checked={formData.experience === level}
                          onChange={handleChange}
                          required
                        />
                        <span className="radio-custom"></span>
                        {level}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="goals">Main Goals *</label>
                  <textarea
                    id="goals"
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Lean muscle gain, fat loss, strength increase..."
                    rows="3"
                  />
                </div>
              </div>

              {/* Product Interests */}
              <div className="form-section">
                <h3>Products of Interest</h3>
                <p className="section-description">
                  Select the categories that interest you
                </p>
                
                <div className="checkbox-grid">
                  {productInterests.map((product, index) => (
                    <label key={index} className="checkbox-label">
                      <input
                        type="checkbox"
                        name="products"
                        value={product}
                        checked={formData.products.includes(product)}
                        onChange={handleChange}
                      />
                      <span className="checkbox-custom"></span>
                      {product}
                    </label>
                  ))}
                </div>
              </div>

              {/* Specific Questions */}
              <div className="form-section">
                <h3>Specific Questions</h3>
                <div className="form-group">
                  <textarea
                    name="questions"
                    value={formData.questions}
                    onChange={handleChange}
                    placeholder="Do you have any particular questions? Specific concerns?"
                    rows="4"
                  />
                </div>
              </div>

              {/* Submission */}
              <div className="form-submit">
                <div className="privacy-note">
                  <input type="checkbox" id="privacy" required />
                  <label htmlFor="privacy">
                    I accept the privacy policy and understand that this consultation 
                    is for educational purposes only.
                  </label>
                </div>
                
                <button type="submit" className="btn btn-primary btn-lg">
                  <span className="btn-icon">📨</span>
                  Send my request
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section dark-section section-padding">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Our <span className="text-gradient">Process</span>
            </h2>
            <p className="section-subtitle">
              How your personalized consultation works
            </p>
          </div>
          
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Initial Analysis</h3>
              <p>Assessment of your profile, goals and history</p>
            </div>
            
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Personalized Plan</h3>
              <p>Creation of a program adapted to your specific needs</p>
            </div>
            
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Expert Consultation</h3>
              <p>Detailed discussion with one of our specialists</p>
            </div>
            
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Continuous Follow-up</h3>
              <p>Support and adjustments throughout your journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="consultation-faq section-padding">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </div>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Is the consultation really free?</h3>
              <p>Yes, the initial consultation is completely free. We believe in the importance of informed guidance before any commitment.</p>
            </div>
            
            <div className="faq-item">
              <h3>How long does the consultation last?</h3>
              <p>The consultation generally lasts between 30 and 45 minutes, depending on the complexity of your situation and your questions.</p>
            </div>
            
            <div className="faq-item">
              <h3>Who are your experts?</h3>
              <p>Our experts are certified professionals with years of experience in the field of performance and supplementation.</p>
            </div>
            
            <div className="faq-item">
              <h3>Can I cancel or reschedule?</h3>
              <p>Absolutely. You can cancel or reschedule your consultation up to 24 hours before the scheduled appointment.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Consultation;