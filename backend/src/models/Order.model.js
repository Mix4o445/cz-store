import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        variant: String,
        qty: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        deliveryFee: { type: Number, default: 0, min: 0 },
        image: String,
      },
    ],
    shipping: {
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      wilaya: String,
    },
    payment: {
      method: { type: String, enum: ['cmi', 'cod', 'bank_transfer'], default: 'cod' },
      status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
      transactionId: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    subtotal: Number,
    shipping_cost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    notes: String,
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
