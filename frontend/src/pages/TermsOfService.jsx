// pages/TermsOfService.jsx
import React from 'react';
import '../styles/PolicyPages.css';

const TermsOfService = () => {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: March 6, 2026</p>

        <section>
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using Mass Labs website and services, you agree to be bound by these Terms of Service. 
            If you disagree with any part of the terms, you may not access our services. These terms apply to all 
            visitors, users, and others who access or use the service.
          </p>
        </section>

        <section>
          <h2>2. Research Purpose Only</h2>
          <p>
            All products sold by Mass Labs are intended for <strong>research purposes only</strong>. Our products are:
          </p>
          <ul>
            <li>Not for human consumption</li>
            <li>Not for veterinary use</li>
            <li>Intended for laboratory research settings only</li>
            <li>Require proper handling by qualified researchers</li>
          </ul>
          <p>
            By purchasing from Mass Labs, you confirm that you are at least 18 years old and will use products 
            strictly for legitimate research purposes in compliance with all applicable laws.
          </p>
        </section>

        <section>
          <h2>3. Product Information</h2>
          <p>
            We strive to provide accurate product information, including descriptions, purity levels, and specifications. 
            However, we do not warrant that product descriptions or other content is accurate, complete, reliable, 
            current, or error-free. All products are sold as research chemicals with no claims regarding their effects.
          </p>
        </section>

        <section>
          <h2>4. Ordering & Payment</h2>
          <p>
            When you place an order, you agree to provide current, complete, and accurate purchase and account information. 
            We reserve the right to refuse or cancel orders at our discretion, including but not limited to:
          </p>
          <ul>
            <li>Suspected fraudulent activity</li>
            <li>Violation of local laws in shipping destination</li>
            <li>Insufficient product availability</li>
            <li>Pricing or product information errors</li>
          </ul>
        </section>

        <section>
          <h2>5. Shipping & Delivery</h2>
          <p>
            Risk of loss and title for items purchased pass to you upon delivery to the carrier. We are not responsible 
            for delays, losses, or damages occurring during shipping. All shipments are made in plain, discreet packaging.
          </p>
        </section>

        <section>
          <h2>6. Limitation of Liability</h2>
          <p>
            Mass Labs shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
            resulting from your use of or inability to use our products or services. Our total liability shall not 
            exceed the amount you paid for the specific product giving rise to the claim.
          </p>
        </section>

        <section>
          <h2>7. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of the European Union, 
            without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes are effective immediately upon posting. 
            Your continued use of the site following changes constitutes acceptance of the revised terms.
          </p>
        </section>

        <section className="contact-section">
          <h2>Contact Us</h2>
          <p>
            For questions about these Terms, please contact us at:{' '}
            <a href="mailto:legal@masslabs.shop">legal@masslabs.shop</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;