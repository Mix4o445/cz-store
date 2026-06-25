import mongoose from 'mongoose';
import slugify from 'slugify';

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    slug: { type: String, unique: true, index: true },
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

brandSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Brand = mongoose.model('Brand', brandSchema);
