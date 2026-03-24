import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
export const emailConfig = {
  // SMTP settings for Hostinger
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== 'false', 
    auth: {
      user: process.env.SMTP_USER || 'contact@masslabs.shop',
      pass: process.env.SMTP_PASS || '',
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
  
  // Sender info
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Mass Labs',
    email: process.env.EMAIL_FROM || 'contact@masslabs.shop',
  },
  
  // Admin email for notifications
  adminEmail: process.env.ADMIN_EMAIL || 'contact@masslabs.shop',
};

// Create transporter
export const createTransporter = async () => {
  const transporter = nodemailer.createTransport(emailConfig.smtp);
  
  // Verify connection
  try {
    await transporter.verify();
    console.log('✅ Email transporter verified');
    return transporter;
  } catch (error) {
    console.error('❌ Email transporter failed:', error.message);
    throw error;
  }
};

// For testing with Ethereal
export const createTestTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  console.log('📧 Test account created:', testAccount.user);
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  
  return { transporter, testAccount };
};

export default emailConfig;