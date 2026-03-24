import emailService from '../services/emailService.js';

export const emailController = {
  // Contact form handler
  async sendContactForm(req, res) {
    try {
      const { name, email, subject, message, urgency, submitted_at } = req.body;
      
      // Validation
      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, subject, and message are required'
        });
      }

      const formData = {
        name,
        email,
        subject,
        message,
        urgency: urgency || 'normal',
        submitted_at: submitted_at || new Date().toLocaleString()
      };

      // Send to admin
      await emailService.sendContactFormAdmin(formData);
      
      // Send auto-reply to customer
      await emailService.sendContactAutoReply(email, name, subject);

      res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully'
      });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send contact form',
        error: error.message
      });
    }
  },

  // Newsletter handler
  async sendNewsletterWelcome(req, res) {
    try {
      const { email, name } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      await emailService.sendNewsletterWelcome(email, name);
      
      res.status(200).json({
        success: true,
        message: 'Welcome email sent successfully'
      });
    } catch (error) {
      console.error('Newsletter error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email'
      });
    }
  }
};