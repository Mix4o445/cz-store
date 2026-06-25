import { z } from 'zod';
import { Order } from '../models/Order.model.js';
import { Product } from '../models/Product.model.js';
import { ok, created } from '../utils/apiResponse.js';
import { badRequest, notFound, forbidden } from '../utils/apiError.js';
import { sendOrderEmails } from '../services/email.service.js';

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string(),
        qty: z.number().int().positive(),
        variantId: z.string().optional(),
      })
    )
    .min(1),
  shipping: z.object({
    name: z.string().min(2),
    phone: z.string().min(6),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().min(3),
    city: z.string().min(2),
    wilaya: z.string().optional().or(z.literal('')),
  }),
  payment: z.object({ method: z.enum(['cmi', 'cod', 'bank_transfer']) }),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

export async function createOrder(req, res, next) {
  try {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());

    const ids = parsed.data.items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: ids } });
    if (products.length !== ids.length) throw badRequest('Some products not found');

    const enriched = parsed.data.items.map((line) => {
      const p = products.find((x) => x._id.toString() === line.product);
      const variant = line.variantId
        ? p.variants?.find((v) => v._id?.toString() === line.variantId)
        : null;
      const price = variant?.price ?? p.price;
      return {
        product: p._id,
        name: p.name?.fr ?? '',
        variant: variant?.capacity,
        qty: line.qty,
        price,
        deliveryFee: p.deliveryFee ?? 0,
        image: p.images?.[0],
      };
    });
    const subtotal = enriched.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping_cost = enriched.reduce(
      (s, i) => s + (i.deliveryFee ?? 0) * i.qty,
      0
    );
    const total = subtotal + shipping_cost;

    const order = await Order.create({
      user: req.user?.sub,
      items: enriched,
      shipping: parsed.data.shipping,
      payment: { method: parsed.data.payment.method, status: 'pending' },
      subtotal,
      shipping_cost,
      total,
      notes: parsed.data.notes,
    });

    // Fire customer + admin notification emails. Do not block the response if
    // SMTP is unconfigured or the call fails.
    Order.findById(order._id)
      .populate('user', 'name email')
      .then((populated) => sendOrderEmails(populated ?? order))
      .catch((e) => console.error('[email] send pipeline failed:', e.message));

    return created(res, order);
  } catch (e) {
    next(e);
  }
}

export async function listAllOrders(req, res, next) {
  try {
    const { status, limit = 100 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .limit(Number(limit))
      .populate('user', 'name email');
    return ok(res, orders);
  } catch (e) {
    next(e);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user.sub }).sort('-createdAt');
    return ok(res, orders);
  } catch (e) {
    next(e);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) throw notFound('Order not found');
    if (req.user?.role !== 'admin' && order.user?._id?.toString() !== req.user?.sub) {
      throw forbidden();
    }
    return ok(res, order);
  } catch (e) {
    next(e);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) throw badRequest('Invalid status');
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) throw notFound('Order not found');
    return ok(res, order);
  } catch (e) {
    next(e);
  }
}
