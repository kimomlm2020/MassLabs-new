import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom ID comme "aaabw"
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: null, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  image: [{ type: String }],
  category: { 
    type: String, 
    required: true,
    enum: ['Injectables', 'Orals', 'SARMs', 'PCT', 'Peptides']
  },
  subCategory: { type: String, required: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  specifications: {
    concentration: { type: String, default: null },
    volume: { type: String, default: null },
    form: { type: String, default: 'Other' },
    manufacturer: { type: String, default: null },
    purity: { type: String, default: null },
    casNumber: { type: String, default: null },
    molecularFormula: { type: String, default: null }
  },
  legal: {
    researchUseOnly: { type: Boolean, default: true },
    notForHumanConsumption: { type: Boolean, default: true },
    warnings: [{ type: String }],
    disclaimer: { type: String, default: "This product is intended for laboratory research use only. Not for human consumption." }
  },
  meta: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }]
  },
  bestseller: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String, lowercase: true }],
  views: { type: Number, default: 0 },
  sales: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ bestseller: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ tags: 1 });

const productModel = mongoose.models.product || mongoose.model('product', productSchema);
export default productModel;