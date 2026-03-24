// pages/ShippingPolicy.jsx
import React from 'react';
import '../styles/PolicyPages.scss';

const ShippingPolicy = () => {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1>Shipping Policy</h1>
        <p className="last-updated">Last Updated: March 6, 2026</p>

        <section className="highlight-box">
          <h2>🚚 Free Shipping</h2>
          <p>
            We offer <strong>FREE EXPRESS SHIPPING</strong> on all orders over €200. 
            Orders below this threshold incur a flat shipping fee of €35.
          </p>
        </section>

        <section>
          <h2>1. Shipping Methods & Timeframes</h2>
          <div className="shipping-table">
            <div className="shipping-row header">
              <span>Region</span>
              <span>Method</span>
              <span>Timeframe</span>
              <span>Cost</span>
            </div>
            <div className="shipping-row">
              <span>Europe (EU)</span>
              <span>Express</span>
              <span>3-5 business days</span>
              <span>€30 / Free over €200</span>
            </div>
            <div className="shipping-row">
              <span>United Kingdom</span>
              <span>Express</span>
              <span>3-5 business days</span>
              <span>€30 / Free over €200</span>
            </div>
            <div className="shipping-row">
              <span>United States</span>
              <span>Express</span>
              <span>5-7 business days</span>
              <span>€30 / Free over €200</span>
            </div>
            <div className="shipping-row">
              <span>Canada</span>
              <span>Express</span>
              <span>5-7 business days</span>
              <span>€30 / Free over €200</span>
            </div>
            <div className="shipping-row">
              <span>Australia</span>
              <span>Express</span>
              <span>7-10 business days</span>
              <span>€30 / Free over €200</span>
            </div>
            <div className="shipping-row">
              <span>Rest of World</span>
              <span>Express</span>
              <span>7-14 business days</span>
              <span>€30 / Free over €200</span>
            </div>
          </div>
        </section>

        <section>
          <h2>2. Discreet Packaging</h2>
          <p>
            All orders are shipped in <strong>plain, unmarked packaging</strong> with no indication of contents. 
            The return address shows only "ML Distribution" with no product references.
          </p>
          <ul>
            <li>No logos or branding on exterior packaging</li>
            <li>Secure, tamper-evident seals</li>
            <li>Multiple layers of protection</li>
            <li>Neutral shipping labels</li>
          </ul>
        </section>

        <section>
          <h2>3. Order Processing</h2>
          <p>
            Orders are processed within 24 business hours. You will receive:
          </p>
          <ul>
            <li>Order confirmation email immediately after purchase</li>
            <li>Shipping confirmation with tracking number within 24 hours</li>
            <li>Delivery updates via email or SMS (if opted in)</li>
          </ul>
        </section>

        <section>
          <h2>4. Tracking Your Order</h2>
          <p>
            All shipments include full tracking. Track your package through:
          </p>
          <ul>
            <li>Your account "Orders" section</li>
            <li>Tracking link in shipping confirmation email</li>
            <li>Direct carrier website with provided tracking number</li>
          </ul>
        </section>

        <section>
          <h2>5. Customs & Import Duties</h2>
          <p>
            <strong>Important:</strong> Customers are responsible for:
          </p>
          <ul>
            <li>Understanding local laws regarding research chemicals</li>
            <li>Paying any customs duties, taxes, or fees</li>
            <li>Providing accurate customs documentation if requested</li>
          </ul>
          <p>
            We declare all shipments as "Research Chemicals" with accurate commercial values. 
            Refusal to pay customs charges will result in package abandonment with no refund.
          </p>
        </section>

        <section>
          <h2>6. Lost or Damaged Packages</h2>
          <p>
            If your package is lost or arrives damaged:
          </p>
          <ul>
            <li>Report within 48 hours of expected delivery</li>
            <li>Provide photos for damaged goods claims</li>
            <li>We will file carrier claims on your behalf</li>
            <li>Reshipment or refund issued after carrier investigation (typically 10-15 days)</li>
          </ul>
        </section>

        <section>
          <h2>7. Restricted Destinations</h2>
          <p>
            We cannot ship to countries with strict import restrictions on research chemicals, including but not limited to:
            Brazil, Norway, Finland, and certain Middle Eastern countries. Contact us to verify shipping availability.
          </p>
        </section>

        <section>
          <h2>8. Address Accuracy</h2>
          <p>
            You are responsible for providing accurate shipping information. Costs for re-shipment due to address 
            errors will be charged to the customer.
          </p>
        </section>

        <section className="contact-section">
          <h2>Shipping Inquiries</h2>
          <p>
            For shipping questions: <a href="mailto:shipping@mass-labs.com">shipping@mass-labs.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;