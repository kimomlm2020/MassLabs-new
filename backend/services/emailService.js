import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/emailConfig.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      this.transporter = nodemailer.createTransport({
        host: EMAIL_CONFIG.SMTP.HOST,
        port: EMAIL_CONFIG.SMTP.PORT,
        secure: EMAIL_CONFIG.SMTP.SECURE,
        auth: {
          user: EMAIL_CONFIG.SMTP.USERNAME,
          pass: EMAIL_CONFIG.SMTP.PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email transporter ready');
      this.initialized = true;
    } catch (error) {
      console.error('❌ Email init failed:', error.message);
      throw error;
    }
  }

  async sendEmail({ to, subject, html, text, from, attachments = [] }) {
    await this.init();

    const mailOptions = {
      from: from || `"${EMAIL_CONFIG.FROM.NAME}" <${EMAIL_CONFIG.FROM.EMAIL}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text: text || this.htmlToText(html),
      html,
      attachments,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
      throw error;
    }
  }

  htmlToText(html) {
    return html
      .replace(/<style[^>]*>.*<\/style>/gs, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // ==================== STRIPE PAYMENT EMAILS ====================

  async sendStripePaymentConfirmation(order) {
    const itemsList = order.items?.map(item => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #333;">
          <strong style="color:#fff;">${item.name}</strong><br>
          <small style="color:#888;">${item.category || ''}${item.specifications?.concentration ? ` - ${item.specifications.concentration}` : ''}</small>
        </td>
        <td style="padding:12px;border-bottom:1px solid #333;text-align:center;color:#fff;">
          ${item.quantity}
        </td>
        <td style="padding:12px;border-bottom:1px solid #333;text-align:right;color:#D4AF37;">
          €${item.price?.toFixed(2)}
        </td>
        <td style="padding:12px;border-bottom:1px solid #333;text-align:right;color:#fff;">
          €${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('') || '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body{margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Georgia,serif;}
          .container{max-width:600px;margin:0 auto;background:#0a0a0a;color:#e0e0e0;}
          .header{background:linear-gradient(135deg,#1a1a1a 0%,#000 100%);padding:40px;text-align:center;border-bottom:3px solid #D4AF37;}
          .header h1{color:#D4AF37;margin:0;font-size:32px;letter-spacing:3px;}
          .header p{color:#888;letter-spacing:2px;margin:10px 0 0 0;}
          .content{padding:30px;}
          .success-box{background:#0d1f0d;border:2px solid #22c55e;padding:25px;margin:20px 0;border-radius:8px;text-align:center;}
          .success-icon{font-size:48px;color:#22c55e;margin-bottom:15px;}
          .order-details{background:#151515;border:1px solid #333;padding:20px;margin:20px 0;border-radius:8px;}
          .detail-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #333;}
          .detail-row:last-child{border-bottom:none;}
          .label{color:#888;font-size:14px;}
          .value{color:#fff;font-weight:500;}
          .total-value{color:#D4AF37;font-size:20px;font-weight:bold;}
          table{width:100%;border-collapse:collapse;margin:20px 0;}
          th{background:#D4AF37;color:#000;padding:12px;text-align:left;font-weight:600;}
          .btn{background:linear-gradient(135deg,#D4AF37 0%,#ffd700 100%);color:#000;padding:15px 40px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;margin:20px 0;}
          .footer{background:#151515;padding:30px;text-align:center;border-top:1px solid #333;}
          .footer p{color:#666;font-size:13px;margin:5px 0;}
          .disclaimer{background:#1a0a0a;border:1px solid #ff6b6b;padding:15px;margin:20px 0;font-size:12px;color:#ff6b6b;text-align:center;}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔬 MASS LABS</h1>
            <p>PREMIUM RESEARCH COMPOUNDS</p>
          </div>
          
          <div class="content">
            <div class="success-box">
              <div class="success-icon">✅</div>
              <h2 style="color:#22c55e;margin:0 0 10px 0;">Payment Successful!</h2>
              <p style="color:#aaa;margin:0;">Your order has been confirmed and is being processed.</p>
            </div>

            <div class="order-details">
              <h3 style="color:#D4AF37;margin-top:0;">📋 Order Details</h3>
              <div class="detail-row">
                <span class="label">Order ID</span>
                <span class="value">#${order._id?.toString().slice(-8).toUpperCase() || 'ML' + Date.now()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date</span>
                <span class="value">${new Date(order.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Method</span>
                <span class="value" style="color:#635BFF;">💳 Stripe</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Status</span>
                <span class="value" style="color:#22c55e;font-weight:bold;">✓ Paid</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount</span>
                <span class="total-value">€${order.amount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <h3 style="color:#D4AF37;">🛒 Ordered Products</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Price</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody style="background:#151515;">
                ${itemsList}
              </tbody>
            </table>

            <div class="disclaimer">
              <strong>🔬 RESEARCH USE ONLY</strong><br>
              These products are intended for laboratory research purposes only. Not for human consumption.
            </div>

            <center>
              <a href="${process.env.FRONTEND_URL || 'https://masslabs.shop'}/orders/${order._id}" class="btn">
                Track My Order
              </a>
            </center>

            <p style="color:#888;font-size:14px;text-align:center;margin-top:30px;">
              You will receive a shipping notification with tracking information once your order is dispatched.
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Mass Labs. All rights reserved.</p>
            <p>Questions? Contact <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@masslabs.com'}" style="color:#D4AF37;">support@masslabs.com</a></p>
            <p style="font-size:11px;color:#444;margin-top:15px;">
              This email was sent to ${order.address?.email || 'customer'} regarding your order at Mass Labs.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: order.address?.email,
      subject: `✅ Payment Confirmed - Order #${order._id?.toString().slice(-6).toUpperCase()}`,
      html
    });
  }

  async sendStripePaymentFailed(order, errorMessage) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body{margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Georgia,serif;}
          .container{max-width:600px;margin:0 auto;background:#0a0a0a;color:#e0e0e0;}
          .header{background:linear-gradient(135deg,#1a1a1a 0%,#000 100%);padding:40px;text-align:center;border-bottom:3px solid #D4AF37;}
          .header h1{color:#D4AF37;margin:0;font-size:32px;}
          .content{padding:30px;}
          .error-box{background:#1a0a0a;border:2px solid #ef4444;padding:25px;margin:20px 0;border-radius:8px;text-align:center;}
          .error-icon{font-size:48px;color:#ef4444;margin-bottom:15px;}
          .btn{background:linear-gradient(135deg,#D4AF37 0%,#ffd700 100%);color:#000;padding:15px 40px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;margin:20px 0;}
          .footer{background:#151515;padding:30px;text-align:center;border-top:1px solid #333;}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔬 MASS LABS</h1>
          </div>
          
          <div class="content">
            <div class="error-box">
              <div class="error-icon">❌</div>
              <h2 style="color:#ef4444;margin:0 0 10px 0;">Payment Failed</h2>
              <p style="color:#aaa;margin:0;">We couldn't process your payment.</p>
              <p style="color:#ff6b6b;margin-top:15px;font-size:14px;">${errorMessage || 'Your card was declined. Please try a different payment method.'}</p>
            </div>

            <div style="background:#151515;border:1px solid #333;padding:20px;margin:20px 0;border-radius:8px;">
              <p style="margin:0 0 10px 0;"><strong>Order ID:</strong> #${order._id?.toString().slice(-8).toUpperCase()}</p>
              <p style="margin:0 0 10px 0;"><strong>Amount:</strong> <span style="color:#D4AF37;font-weight:bold;">€${order.amount?.toFixed(2) || '0.00'}</span></p>
              <p style="margin:0;color:#888;font-size:14px;">Your cart has been saved. You can retry payment within 24 hours.</p>
            </div>

            <center>
              <a href="${process.env.FRONTEND_URL || 'https://masslabs.shop'}/checkout?retry=${order._id}" class="btn">
                Retry Payment
              </a>
            </center>
          </div>
          
          <div class="footer">
            <p>Need help? Contact <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@masslabs.com'}" style="color:#D4AF37;">support@masslabs.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: order.address?.email,
      subject: `❌ Payment Failed - Order #${order._id?.toString().slice(-6).toUpperCase()}`,
      html
    });
  }

  async sendStripeRefundConfirmation(order, refundAmount) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body{margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Georgia,serif;}
          .container{max-width:600px;margin:0 auto;background:#0a0a0a;color:#e0e0e0;}
          .header{background:linear-gradient(135deg,#1a1a1a 0%,#000 100%);padding:40px;text-align:center;border-bottom:3px solid #D4AF37;}
          .header h1{color:#D4AF37;margin:0;font-size:32px;}
          .content{padding:30px;}
          .refund-box{background:#0d1f0d;border:2px solid #22c55e;padding:25px;margin:20px 0;border-radius:8px;text-align:center;}
          .refund-amount{font-size:36px;color:#22c55e;font-weight:bold;margin:15px 0;}
          .footer{background:#151515;padding:30px;text-align:center;border-top:1px solid #333;}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔬 MASS LABS</h1>
          </div>
          
          <div class="content">
            <div class="refund-box">
              <h2 style="color:#22c55e;margin:0 0 10px 0;">💰 Refund Processed</h2>
              <p style="color:#aaa;margin:0;">Your refund has been initiated.</p>
              <div class="refund-amount">€${refundAmount?.toFixed(2) || order.amount?.toFixed(2)}</div>
              <p style="color:#888;font-size:14px;">The refund will appear in your account within 5-10 business days.</p>
            </div>

            <div style="background:#151515;border:1px solid #333;padding:20px;margin:20px 0;border-radius:8px;">
              <p style="margin:0 0 10px 0;"><strong>Order ID:</strong> #${order._id?.toString().slice(-8).toUpperCase()}</p>
              <p style="margin:0 0 10px 0;"><strong>Original Amount:</strong> €${order.amount?.toFixed(2)}</p>
              <p style="margin:0;"><strong>Refund Reason:</strong> ${order.refundReason || 'Customer request'}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Questions? Contact <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@masslabs.com'}" style="color:#D4AF37;">support@masslabs.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: order.address?.email,
      subject: `💰 Refund Processed - Order #${order._id?.toString().slice(-6).toUpperCase()}`,
      html
    });
  }

  // ==================== ADMIN NOTIFICATIONS ====================

  async sendNewOrderNotificationToAdmin(order) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@masslabs.com';
    
    const itemsList = order.items?.map(item => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #333;">
          <strong>${item.name}</strong>
          ${item.specifications?.concentration ? `<br><small style="color:#888;">${item.specifications.concentration}</small>` : ''}
        </td>
        <td style="padding:10px;border-bottom:1px solid #333;text-align:center;">${item.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #333;text-align:right;">€${item.price?.toFixed(2)}</td>
      </tr>
    `).join('') || '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;}
          .container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);}
          .header{background:#635BFF;color:#fff;padding:20px;text-align:center;}
          .content{padding:30px;}
          .info-box{background:#f8f9fa;border-radius:6px;padding:20px;margin:15px 0;}
          table{width:100%;border-collapse:collapse;margin:15px 0;}
          td{padding:10px;border-bottom:1px solid #dee2e6;}
          .btn{background:#635BFF;color:#fff;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;}
          .total{font-size:20px;color:#635BFF;font-weight:bold;}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0;">🛒 New Stripe Order</h2>
          </div>
          <div class="content">
            <div class="info-box">
              <h3 style="margin-top:0;color:#635BFF;">Payment Confirmed</h3>
              <p style="font-size:24px;margin:10px 0;" class="total">€${order.amount?.toFixed(2)}</p>
              <p style="color:#666;">Order ID: ${order._id}</p>
            </div>

            <h3>👤 Customer</h3>
            <table>
              <tr><td><strong>Name</strong></td><td>${order.address?.firstName} ${order.address?.lastName}</td></tr>
              <tr><td><strong>Email</strong></td><td><a href="mailto:${order.address?.email}">${order.address?.email}</a></td></tr>
              <tr><td><strong>Phone</strong></td><td>${order.address?.phone || 'N/A'}</td></tr>
            </table>

            <h3>🛒 Products</h3>
            <table>
              ${itemsList}
              <tr style="background:#f8f9fa;font-weight:bold;">
                <td colspan="2">TOTAL</td>
                <td style="text-align:right;color:#635BFF;">€${order.amount?.toFixed(2)}</td>
              </tr>
            </table>

            <div style="text-align:center;margin-top:30px;">
              <a href="${process.env.ADMIN_URL || 'http://localhost:5174'}/orders/${order._id}" class="btn">
                View Order
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `🛒 New Order - €${order.amount?.toFixed(2)} - ${order.address?.firstName} ${order.address?.lastName}`,
      html
    });
  }

  // ==================== CONTACT FORM EMAILS ====================

  async sendContactFormAdmin(formData) {
    const subject = `📧 New Contact: ${formData.subject} (${formData.urgency.toUpperCase()})`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;}
          .header{background:#1a1a1a;color:#d4af37;padding:20px;text-align:center;}
          .content{background:#f9f9f9;padding:20px;border:1px solid #ddd;}
          .field{margin-bottom:15px;padding:10px;background:white;border-left:3px solid #d4af37;}
          .label{font-weight:bold;color:#666;font-size:12px;text-transform:uppercase;}
          .value{font-size:14px;margin-top:5px;}
          .urgency-high{border-left-color:#ef4444;}
          .urgency-urgent{border-left-color:#dc2626;background:#fef2f2;}
          .message-box{background:white;padding:15px;border:1px solid #ddd;margin-top:20px;}
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🔬 Mass Labs - New Contact Form</h2>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">From</div>
            <div class="value">${formData.name} &lt;${formData.email}&gt;</div>
          </div>
          <div class="field">
            <div class="label">Subject</div>
            <div class="value">${formData.subject}</div>
          </div>
          <div class="field urgency-${formData.urgency}">
            <div class="label">Urgency</div>
            <div class="value" style="text-transform:uppercase;font-weight:bold;">
              ${formData.urgency}
            </div>
          </div>
          <div class="field">
            <div class="label">Submitted</div>
            <div class="value">${formData.submitted_at || new Date().toLocaleString()}</div>
          </div>
          <div class="message-box">
            <div class="label">Message</div>
            <div class="value" style="white-space:pre-wrap;">${formData.message}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: process.env.ADMIN_EMAIL || 'contact@masslabs.shop',
      subject,
      html,
      from: `"Mass Labs Contact" <${formData.email}>`
    });
  }

  async sendContactAutoReply(email, name, subject) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body{font-family:'Segoe UI',sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;}
          .header{background:linear-gradient(135deg,#1a1a1a,#0d0d0d);padding:30px;text-align:center;}
          .header h1{color:#d4af37;margin:0;}
          .content{background:#fff;padding:30px;border:1px solid #e0e0e0;}
          .footer{background:#f5f5f5;padding:20px;text-align:center;font-size:12px;color:#666;}
          .highlight{color:#d4af37;font-weight:bold;}
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔬 MASS LABS</h1>
        </div>
        <div class="content">
          <h2>Hello ${name || 'there'},</h2>
          <p>Thank you for contacting Mass Labs regarding: <span class="highlight">${subject}</span></p>
          <p>We have received your message and our team will review it within <span class="highlight">24 hours</span>.</p>
          <p>For urgent matters, please use our live chat.</p>
          <p>Best regards,<br><strong>The Mass Labs Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated response. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'We received your message - Mass Labs',
      html
    });
  }

  // ==================== NEWSLETTER EMAILS ====================

  async sendNewsletterWelcome(email, name = '') {
    const subject = 'Welcome to Mass Labs Inner Circle! 🔬';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body{font-family:'Segoe UI',sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;}
          .header{background:linear-gradient(135deg,#1a1a1a,#0d0d0d);padding:30px;text-align:center;border-radius:8px 8px 0 0;}
          .header h1{color:#d4af37;margin:0;}
          .content{background:#fff;padding:30px;border:1px solid #e0e0e0;border-top:none;}
          .btn{display:inline-block;background:linear-gradient(135deg,#d4af37,#ffd700);color:#0a0a0a;padding:12px 30px;text-decoration:none;border-radius:6px;font-weight:bold;margin:20px 0;}
          .highlight{color:#d4af37;font-weight:bold;}
          .footer{background:#f5f5f5;padding:20px;text-align:center;font-size:12px;color:#666;border-radius:0 0 8px 8px;}
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔬 MASS LABS</h1>
        </div>
        <div class="content">
          <h2>Welcome to the Inner Circle, ${name || 'Future Athlete'}!</h2>
          <p>Thank you for subscribing. You're now part of an exclusive community.</p>
          <h3>What to expect:</h3>
          <ul>
            <li>🧪 <span class="highlight">New compound announcements</span></li>
            <li>📊 <span class="highlight">Lab results & certificates</span></li>
            <li>💎 <span class="highlight">Member-only discounts</span></li>
          </ul>
          <center>
            <a href="${process.env.FRONTEND_URL || 'https://masslabs.shop'}/shop" class="btn">Explore Products</a>
          </center>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Mass Labs | <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a></p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html
    });
  }
}

// Export singleton instance
export default new EmailService();