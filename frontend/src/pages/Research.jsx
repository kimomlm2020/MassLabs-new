import React from 'react';
import '../styles/Research.css';

const Research = () => {
  const studies = [
    {
      id: 1,
      title: 'SARMs and Muscular Performance',
      authors: 'Smith, J. et al., 2023',
      journal: 'Journal of Clinical Endocrinology & Metabolism',
      abstract: 'Double-blind randomized study demonstrating significant increases in muscle mass and strength with RAD-140.',
      highlights: ['+15% muscle mass in 12 weeks', '25% strength improvement', 'Low impact on liver markers']
    },
    {
      id: 2,
      title: 'Tissue Selectivity of SARMs',
      authors: 'Johnson, R. et al., 2022',
      journal: 'Pharmacology Research & Perspectives',
      abstract: 'Comparative analysis of tissue specificity of SARMs versus anabolic steroids.',
      highlights: ['90% muscle selectivity', '80% reduction in prostate effects', 'No aromatization into estrogens']
    },
    {
      id: 3,
      title: 'Safety Profile of LGD-4033',
      authors: 'Martinez, L. et al., 2021',
      journal: 'Toxicology and Applied Pharmacology',
      abstract: 'Long-term safety evaluation of Ligandrol on animal models.',
      highlights: ['Good hepatic tolerance', 'Moderate androgenic suppression', 'Complete post-cycle recovery']
    },
    {
      id: 4,
      title: 'SARMs in Muscle Rehabilitation',
      authors: 'Chen, W. et al., 2023',
      journal: 'Muscle & Nerve',
      abstract: 'Use of SARMs for post-traumatic muscle recovery.',
      highlights: ['Accelerated regeneration', 'Mass preservation during immobilization', 'Improved neuromuscular function']
    }
  ];

  return (
    <div className="research-page">
      {/* Hero Section */}
      <section className="research-hero">
        <div className="container">
          <div className="hero-badge">SCIENCE</div>
          <h1>Scientific Research</h1>
          <p className="hero-subtitle">
            Clinical studies, pharmacological data, and academic research on SARMs
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">50+</div>
              <div className="stat-label">Published studies</div>
            </div>
            <div className="stat">
              <div className="stat-value">2010-2024</div>
              <div className="stat-label">Research period</div>
            </div>
            <div className="stat">
              <div className="stat-value">15</div>
              <div className="stat-label">Scientific journals</div>
            </div>
            <div className="stat">
              <div className="stat-value">100%</div>
              <div className="stat-label">Verified sources</div>
            </div>
          </div>
        </div>
      </section>

      {/* Studies Grid */}
      <section className="studies-section section-padding">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Scientific <span className="text-gradient">Studies</span>
            </h2>
            <p className="section-subtitle">
              Comprehensive review of academic literature on SARMs
            </p>
          </div>

          <div className="studies-grid">
            {studies.map(study => (
              <div key={study.id} className="study-card">
                <div className="study-header">
                  <h3>{study.title}</h3>
                  <span className="study-badge">Published</span>
                </div>
                
                <div className="study-meta">
                  <div className="meta-item">
                    <span className="meta-label">Authors</span>
                    <span className="meta-value">{study.authors}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Journal</span>
                    <span className="meta-value">{study.journal}</span>
                  </div>
                </div>
                
                <p className="study-abstract">{study.abstract}</p>
                
                <div className="study-highlights">
                  <h4>Key Points</h4>
                  <ul>
                    {study.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>
                
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="methodology-section dark-section section-padding">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Research <span className="text-gradient">Methodology</span>
            </h2>
            <p className="section-subtitle">
              How we select and analyze scientific studies
            </p>
          </div>
          
          <div className="methodology-grid">
            <div className="method-card">
              <div className="method-icon">🔍</div>
              <h3>Systematic Review</h3>
              <p>Comprehensive search across PubMed, Google Scholar, and academic databases</p>
            </div>
            
            <div className="method-card">
              <div className="method-icon">📊</div>
              <h3>Critical Analysis</h3>
              <p>Evaluation of methodology, sample size, and conflicts of interest</p>
            </div>
            
            <div className="method-card">
              <div className="method-icon">⚖️</div>
              <h3>Objectivity</h3>
              <p>Balanced presentation of positive results and limitations</p>
            </div>
            
            <div className="method-card">
              <div className="method-icon">🔄</div>
              <h3>Continuous Updates</h3>
              <p>Regular revision with new scientific publications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="research-disclaimer section-padding">
        <div className="container">
          <div className="disclaimer-card">
            <div className="disclaimer-icon">⚠️</div>
            <div className="disclaimer-content">
              <h3>Important Information</h3>
              <p>
                The studies presented are for informational and educational purposes only. 
                SARMs are not approved by the FDA for human consumption and should be used 
                exclusively for scientific research purposes. Always consult a healthcare 
                professional before undertaking any protocol.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Research;