import express from 'express';
import nodemailer from 'nodemailer';
import Subscriber from '../models/subscriberModel.js';

const router = express.Router();

// Create SMTP transporter for Hostinger
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: (parseInt(process.env.SMTP_PORT) || 465) === 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,      // your-email@yourdomain.com
    pass: process.env.SMTP_PASS,      // your email password
  },
  tls: {
    rejectUnauthorized: false // only for development, remove in production
  }
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server Ready - Can send emails');
  }
});

// POST /api/email/subscribe - Create new subscriber
router.post('/subscribe', async (req, res) => {
  try {
    const { email, consent } = req.body;

    if (!email || !consent) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and consent are required' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existingSubscriber) {
      return res.status(409).json({ 
        success: false,
        message: 'This email is already subscribed' 
      });
    }

    const subscriber = new Subscriber({
      email: email.toLowerCase(),
      consent,
      subscribedAt: new Date(),
      active: true
    });

    await subscriber.save();

    // Send welcome email to new subscriber
    try {
      await transporter.sendMail({
        from: `"Mass Labs" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to Mass Labs Newsletter',
        html: `
          <h2>Welcome to Mass Labs!</h2>
          <p>Thank you for subscribing to our newsletter.</p>
          <p>You'll receive exclusive updates on new compounds, lab results, and member-only discounts.</p>
          <br>
          <p>Best regards,</p>
          <p><strong>Mass Labs Team</strong></p>
        `
      });
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if welcome email fails
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      subscriber: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while processing subscription' 
    });
  }
});

// GET /api/email/subscribers - Get all subscribers (admin route)
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/email/contact - Contact form submission (NOW SENDS REAL EMAILS)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, and message are required' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // Send email to your webmail
    const mailOptions = {
      from: `"Mass Labs Contact" <${process.env.SMTP_USER}>`,
      to: process.env.RECEIVER_EMAIL || process.env.SMTP_USER, // your receiving email
      replyTo: email, // allows you to reply directly to the sender
      subject: `Contact Form: ${subject || 'New Message from Mass Labs'}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject || 'N/A'}

Message:
${message}

---
Sent from Mass Labs Contact Form
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <table style="width: 100%; margin: 20px 0;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 100px;">Name:</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">
                <a href="mailto:${email}">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
              <td style="padding: 8px 0;">${subject || 'N/A'}</td>
            </tr>
          </table>
          
          <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #333;">Message:</h4>
            <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            Sent from Mass Labs Contact Form
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Contact email sent from:', email);

    // Optional: Send confirmation to the user
    try {
      await transporter.sendMail({
        from: `"Mass Labs" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'We received your message - Mass Labs',
        html: `
          <h2>Thank you for contacting us, ${name}!</h2>
          <p>We have received your message and will get back to you within 24-48 hours.</p>
          <p>For urgent matters, please contact us directly at contact@masslabs.shop</p>
          <br>
          <p>Best regards,</p>
          <p><strong>Mass Labs Team</strong></p>
        `
      });
    } catch (confirmError) {
      console.error('Failed to send confirmation email:', confirmError);
    }

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send message. Please try again later.' 
    });
  }
});

export default router;