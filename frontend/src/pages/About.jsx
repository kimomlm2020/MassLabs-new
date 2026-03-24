import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import '../styles/About.scss'

const About = () => {
  // Safety check for assets to prevent runtime errors
  const aboutAssets = assets?.about_contact || {};

  return (
    <main className="about">
      <div className="about__container">

        {/* HERO */}
        <section className="about__hero">
          <img
            className="about__hero-img"
            src={aboutAssets.Ab_h}
            alt="Training facility"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/default-hero.jpg';
            }}
          />
          <div className="about__hero-content">
            <h1 className="about__title">About Mass Labs</h1>
            <p className="about__subtitle">
              Passion, research, and excellence – since 2020 we have been providing 
              the most advanced formulations for athletes who push their limits.
            </p>
          </div>
        </section>

        {/* MISSION */}
        <section className="about__section">
          <div className="about__text">
            <h2>Our Mission</h2>
            <p>
              To put pure molecules in your hands, precisely dosed and accompanied by 
              clear protocols. We believe that extreme performance must go hand in hand 
              with safety and scientific rigor.
            </p>
            <ul className="about__list">
              <li>Purity ≥ 99% (HPLC)</li>
              <li>Independent third-party testing</li>
              <li>Discreet & traceable delivery</li>
              <li>7/7 customer support</li>
            </ul>
          </div>

          <div className="about__image">
            <img
              src={aboutAssets.Ab_Lb}
              alt="Mass Labs Laboratory"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default-lab.jpg';
              }}
            />
          </div>
        </section>

        {/* QUALITY - Restructured with list like "Behind Mass Labs" */}
        <section className="about__section about__section--alt">
          <div className="about__image">
            <img
              src={aboutAssets.Ab_qua}
              alt="Quality control – laboratory tubes"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default-quality.jpg';
              }}
            />
          </div>

          <div className="about__text">
            <h2>Values & Commitment</h2>
            <p>
              Every batch is tested by accredited laboratories. We publish analysis reports to guarantee transparency and trust.
            </p>
            <ul className="about__list about__list--dash">
              <li>ISO 17025 Accredited Testing</li>
              <li>Published COAs (Certificates of Analysis)</li>
              <li>Full Traceability & Batch Tracking</li>
              <li>GMP Certified Manufacturing</li>
            </ul>
          </div>
        </section>

        {/* TEAM */}
        <section className="about__section">
          <div className="about__text">
            <h2>Behind Mass Labs</h2>
            <p>
              Chemists, formulation engineers, and sports coaches: a multidisciplinary 
              team united by a passion for performance and scientific rigor.
            </p>
          </div>

          <div className="about__image">
            <img
              src={aboutAssets.Ab_team}
              alt="Mass Labs Team"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default-team.jpg';
              }}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="about__cta">
          <h2>Ready to push your limits?</h2>
          <p>Join over 10,000 athletes who trust us.</p>

          <div className="about__actions">
            <Link to="/shop" className="btn btn--primary">Discover our products</Link>
            <Link to="/contact" className="btn btn--outline">Contact us</Link>
          </div>
        </section>

      </div>
    </main>
  );
};

export default About;