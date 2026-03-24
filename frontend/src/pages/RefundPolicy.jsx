// pages/RefundPolicy.jsx
import React from 'react';
import '../styles/PolicyPages.scss';

const RefundPolicy = () => {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1>Refund Policy</h1>
        <p className="last-updated">Last Updated: March 6, 2026</p>

        <section className="highlight-box warning">
          <h2>⚠️ Important Notice</h2>
          <p>
            Due to the nature of research chemical products, <strong>all sales are final</strong> 
            once the product seal is broken or the package is opened. Please review your order carefully before purchasing.
          </p>
        </section>

        <section>
          <h2>1. Eligibility for Refunds</h2>
          <p>We offer refunds or replacements only in the following circumstances:</p>
          
          <h3>✅ Eligible Situations:</h3>
          <ul>
            <li>Product arrived damaged or defective (with photo evidence)</li>
            <li>Wrong product shipped</li>
            <li>Product quality does not match COA (Certificate of Analysis)</li>
            <li>Package lost in transit (confirmed by carrier)</li>
            <li>Order cancelled before shipment (within 2 hours of purchase)</li>
          </ul>

          <h3>❌ Not Eligible:</h3>
          <ul>
            <li>Change of mind after purchase</li>
            <li>Delayed delivery (outside our control)</li>
            <li>Customs seizure (customer responsibility to know local laws)</li>
            <li>Products opened or used</li>
            <li>Incorrect address provided by customer</li>
          </ul>
        </section>

        <section>
          <h2>2. Refund Process</h2>
          <div className="process-steps">
            <div className="step">
              <span className="step-number">1</span>
              <h4>Contact Us</h4>
              <p>Email support@mass-labs.com within 48 hours of delivery with order number and issue description.</p>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <h4>Provide Evidence</h4>
              <p>Submit clear photos of damaged/defective products and packaging.</p>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <h4>Review</h4>
              <p>Our team reviews your claim within 2-3 business days.</p>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <h4>Resolution</h4>
              <p>Approved claims receive replacement shipment or refund to original payment method.</p>
            </div>
          </div>
        </section>

        <section>
          <h2>3. Refund Types</h2>
          <table className="policy-table">
            <thead>
              <tr>
                <th>Situation</th>
                <th>Refund Type</th>
                <th>Timeline</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pre-shipment cancellation</td>
                <td>Full refund</td>
                <td>3-5 business days</td>
              </tr>
              <tr>
                <td>Damaged/defective product</td>
                <td>Replacement or full refund</td>
                <td>5-10 business days</td>
              </tr>
              <tr>
                <td>Wrong item shipped</td>
                <td>Replacement + return label</td>
                <td>5-7 business days</td>
              </tr>
              <tr>
                <td>Lost in transit</td>
                <td>Replacement or full refund</td>
                <td>After carrier investigation (10-15 days)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>4. Return Process (When Applicable)</h2>
          <p>
            In rare cases requiring return (wrong item shipped), we provide:
          </p>
          <ul>
            <li>Prepaid return shipping label</li>
            <li>Instructions for safe repackaging</li>
            <li>Replacement shipment upon return receipt</li>
          </ul>
          <p>
            <strong>Never return products without authorization.</strong> Unauthorized returns will be refused.
          </p>
        </section>

        <section>
          <h2>5. Refund Method & Timing</h2>
          <p>
            Approved refunds are processed to the original payment method:
          </p>
          <ul>
            <li>Credit/Debit Cards: 5-10 business days (bank dependent)</li>
            <li>Cryptocurrency: 1-3 business days</li>
            <li>Bank Transfer: 7-14 business days</li>
          </ul>
          <p>
            You will receive email confirmation when the refund is issued.
          </p>
        </section>

        <section>
          <h2>6. Store Credit</h2>
          <p>
            In certain situations, we may offer store credit as an alternative to refunds. Store credit:
          </p>
          <ul>
            <li>Never expires</li>
            <li>Can be used for any product</li>
            <li>Is transferable (with account verification)</li>
            <li>May include bonus credit for accepting over refunds</li>
          </ul>
        </section>

        <section>
          <h2>7. Chargebacks & Disputes</h2>
          <p>
            Filing a chargeback without contacting us first violates our terms and will result in:
          </p>
          <ul>
            <li>Immediate account termination</li>
            <li>Reporting to fraud databases</li>
            <li>Legal action for fraudulent claims</li>
            <li>Blacklist from future purchases</li>
          </ul>
          <p>
            We are committed to resolving issues directly. Always contact us first.
          </p>
        </section>

        <section className="contact-section">
          <h2>Refund Inquiries</h2>
          <p>
            Email: <a href="mailto:support@mass-labs.com">support@mass-labs.com</a><br />
            Response time: Within 24 hours
          </p>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;