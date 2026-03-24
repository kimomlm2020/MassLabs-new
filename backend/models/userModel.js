import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  firstName: { type: String, default: '', trim: true },
  lastName: { type: String, default: '', trim: true },
  email: { type: String, default: '', trim: true },
  phone: { type: String, default: '', trim: true },
  street: { type: String, default: '', trim: true },
  apartment: { type: String, default: '', trim: true },
  city: { type: String, default: '', trim: true },
  state: { type: String, default: '', trim: true },
  zipcode: { type: String, default: '', trim: true },
  country: { type: String, default: 'FR', trim: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '', trim: true },
  avatar: { type: String, default: '' },
  address: addressSchema,
  cartData: { type: Object, default: {} }, // { productId: quantity }
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null }
}, { timestamps: true });

// Index unique déjà créé par unique: true sur email
userSchema.index({ role: 1 });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;