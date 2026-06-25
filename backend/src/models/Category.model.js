import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: {
      fr: { type: String, required: true, trim: true },
      ar: { type: String, trim: true },
    },
    slug: { type: String, unique: true, index: true },
    icon: String,
    image: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function (next) {
  if (!this.slug && this.name?.fr) {
    this.slug = slugify(this.name.fr, { lower: true, strict: true });
  }
  next();
});

export const Category = mongoose.model('Category', categorySchema);
