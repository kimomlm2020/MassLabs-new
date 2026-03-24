import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,  // Automatically creates index, don't declare again
    lowercase: true,
    trim: true
  },
  consent: {
    type: Boolean,
    required: true,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    default: 'footer'
  }
}, {
  timestamps: true
});

// Only keep non-duplicate indexes
subscriberSchema.index({ subscribedAt: -1 });

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;