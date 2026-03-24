// pages/PrivacyPolicy.jsx
import React from 'react';
import '../styles/PolicyPages.scss';

const PrivacyPolicy = () => {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: March 6, 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li>Name and contact information (email, phone, address)</li>
            <li>Payment information (processed securely by our payment providers)</li>
            <li>Order history and preferences</li>
            <li>Communications with our support team</li>
            <li>IP address and browser information (automatically collected)</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about orders, products, and promotions</li>
            <li>Improve our website and customer service</li>
            <li>Detect and prevent fraud and abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>3. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information. We may share information with:
          </p>
          <ul>
            <li>Shipping carriers to deliver your orders</li>
            <li>Payment processors to complete transactions</li>
            <li>Service providers who assist our operations (under strict confidentiality)</li>
            <li>Law enforcement when required by law or to protect our rights</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against 
            unauthorized access, alteration, disclosure, or destruction. This includes:
          </p>
          <ul>
            <li>SSL/TLS encryption for all data transmission</li>
            <li>Secure server infrastructure with regular security audits</li>
            <li>Limited access to personal data by authorized personnel only</li>
            <li>Regular security assessments and updates</li>
          </ul>
        </section>

        <section>
          <h2>5. Cookies & Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, 
            and understand user behavior. You can control cookies through your browser settings. Disabling cookies 
            may affect site functionality.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>Under GDPR and applicable laws, you have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request deletion of your data ("right to be forgotten")</li>
            <li>Restrict or object to processing</li>
            <li>Data portability</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:privacy@mass-labs.com">privacy@mass-labs.com</a>.</p>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>
            We retain your personal data only as long as necessary for the purposes outlined in this policy, 
            or as required by law. Order and payment records are retained for 7 years for tax and legal compliance.
          </p>
        </section>

        <section>
          <h2>8. International Transfers</h2>
          <p>
            Your data may be transferred to and processed in countries outside the European Economic Area (EEA). 
            We ensure appropriate safeguards are in place for such transfers in compliance with GDPR requirements.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under 18 years of age. We do not knowingly collect 
            personal information from children. If we discover such data, we will delete it immediately.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant changes by email 
            or through a prominent notice on our website.
          </p>
        </section>

        <section className="contact-section">
          <h2>Contact Us</h2>
          <p>
            Data Protection Officer: <a href="mailto:dpo@mass-labs.com">dpo@mass-labs.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;