import mongoose from 'mongoose';

const { Schema } = mongoose;

const settingsSchema = new Schema({
  storeName: { type: String, default: 'Mass Labs' },
  storeEmail: { type: String, default: 'contact@masslabs.com' },
  storePhone: { type: String, default: '+33 1 23 45 67 89' },
  storeDescription: { type: String, default: 'Premium anabolic products for serious athletes' },
  currency: { type: String, default: 'GBP' },
  timezone: { type: String, default: 'Europe/London' },
  language: { type: String, default: 'en' },
  primaryColor: { type: String, default: '#D4AF37' },
  secondaryColor: { type: String, default: '#635BFF' },
  darkMode: { type: Boolean, default: true },
  logo: { type: String, default: null },
  favicon: { type: String, default: null },
  shippingCost: { type: Number, default: 30 },
  freeShippingThreshold: { type: Number, default: 200 },
  shippingFrom: { type: String, default: 'UK' },
  estimatedDeliveryDays: { type: String, default: '5-10' },
  stripeEnabled: { type: Boolean, default: true },
  stripePublicKey: { type: String, default: '' },
  stripeSecretKey: { type: String, default: '' },
  paypalEnabled: { type: Boolean, default: false },
  paypalClientId: { type: String, default: '' },
  cryptoEnabled: { type: Boolean, default: false },
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' },
  senderEmail: { type: String, default: 'noreply@masslabs.com' },
  senderName: { type: String, default: 'Mass Labs' },
  twoFactorEnabled: { type: Boolean, default: false },
  maxLoginAttempts: { type: Number, default: 5 },
  sessionTimeout: { type: Number, default: 60 },
  requireEmailVerification: { type: Boolean, default: true },
  metaTitle: { type: String, default: 'Mass Labs - Premium Anabolic Products' },
  metaDescription: { type: String, default: 'High quality injectables, orals, SARMs and more' },
  googleAnalyticsId: { type: String, default: '' },
  facebookPixelId: { type: String, default: '' },
  termsUrl: { type: String, default: '/terms' },
  privacyUrl: { type: String, default: '/privacy' },
  refundPolicy: { type: String, default: '30-day refund policy for unopened products' },
  orderNotifications: { type: Boolean, default: true },
  lowStockAlert: { type: Boolean, default: true },
  lowStockThreshold: { type: Number, default: 10 },
  newUserNotifications: { type: Boolean, default: false },
  dailyReports: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  collection: 'settings'
});



const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;