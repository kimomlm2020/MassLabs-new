import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, max: 10 },
  image: { type: String, default: null },
  category: { type: String, required: true },
  subCategory: { type: String, default: 'general' },
  sku: { type: String, required: true },
  specifications: {
    concentration: String,
    volume: String,
    form: String
  }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  apartment: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  zipcode: { type: String, required: true },
  country: { type: String, required: true, default: 'FR' },
  fullName: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true,
    index: true 
  },
  items: [orderItemSchema],
  amount: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  shipping: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  address: addressSchema,
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: { type: String, enum: ['stripe'], required: true, default: 'stripe' },
  payment: { type: Boolean, default: false },
  paymentDate: { type: Date, default: null },
  stripeSessionId: { type: String, default: null, index: true },
  stripePaymentIntentId: { type: String, default: null },
  trackingNumber: { type: String, default: null },
  carrier: { type: String, default: null },
  shippedAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  adminNotes: { type: String, default: '' },
  customerNotes: { type: String, default: '' },
  // ✅ Champ date personnalisé (pas de conflit avec timestamps)
  date: { type: Date, default: Date.now }
}, {
  // ✅ Désactiver les timestamps automatiques pour éviter le conflit
  timestamps: false
});

// Indexes
orderSchema.index({ userId: 1, date: -1 });
orderSchema.index({ status: 1, date: -1 });

// ✅ Middleware pre-save avec fonction régulière et gestion d'erreur
orderSchema.pre('save', function(next) {
  try {
    // Générer fullName
    if (this.address && this.address.firstName && this.address.lastName) {
      this.address.fullName = `${this.address.firstName} ${this.address.lastName}`.trim();
    }
    
    // Générer SKU si manquant pour chaque item
    if (this.items && Array.isArray(this.items)) {
      this.items.forEach(item => {
        if (!item.sku) {
          item.sku = `SKU-${item.productId.slice(-6).toUpperCase()}`;
        }
        if (!item.subCategory) {
          item.subCategory = item.category || 'general';
        }
      });
    }
    
    // Mettre à jour la date
    this.date = new Date();
    
    // ✅ Vérifier que next est bien une fonction avant d'appeler
    if (typeof next === 'function') {
      return next();
    }
  } catch (error) {
    console.error('Pre-save middleware error:', error);
    if (typeof next === 'function') {
      return next(error);
    }
    throw error;
  }
});

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);
export default orderModel;