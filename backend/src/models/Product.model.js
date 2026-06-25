import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    name: {
      fr: { type: String, required: true, trim: true },
      ar: { type: String, trim: true },
    },
    description: {
      fr: { type: String, default: '' },
      ar: { type: String, default: '' },
    },
    brand: { type: String, trim: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    price: { type: Number, required: true, min: 0 },
    priceOld: { type: Number, min: 0 },
    images: [{ type: String }],
    specs: {
      capacity: String,
      energyClass: String,
      coverage: String,
      inverter: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      heating: { type: Boolean, default: false },
      noise: String,
      warranty: String,
    },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    isPromo: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String, trim: true, lowercase: true, index: true }],
    deliveryFee: { type: Number, default: 0, min: 0 },
    variants: [
      {
        capacity: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        priceOld: { type: Number, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
        sku: { type: String, trim: true },
      },
    ],
    slug: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

productSchema.index({ 'name.fr': 'text', 'name.ar': 'text', brand: 'text' });

productSchema.pre('validate', function (next) {
  if (!this.slug && this.name?.fr) {
    this.slug = slugify(`${this.name.fr}-${Math.random().toString(36).slice(2, 6)}`, {
      lower: true,
      strict: true,
    });
  }
  next();
});

export const Product = mongoose.model('Product', productSchema);
