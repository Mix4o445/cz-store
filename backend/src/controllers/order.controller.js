import { z } from 'zod';
import { ordersRepo } from '../db/orders.repo.js';
import { productsRepo } from '../db/products.repo.js';
import { ok, created } from '../utils/apiResponse.js';
import { badRequest, notFound, forbidden } from '../utils/apiError.js';
import { sendOrderEmails } from '../services/email.service.js';
import { isUuid } from '../utils/ids.js';

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

    const ids = [...new Set(parsed.data.items.map((i) => i.product))].filter(isUuid);
    const products = await productsRepo.byIds(ids);
    const byId = new Map(products.map((p) => [p._id, p]));
    if (parsed.data.items.some((line) => !byId.has(line.product))) {
      throw badRequest('Some products not found');
    }

    const enriched = parsed.data.items.map((line) => {
      const p = byId.get(line.product);
      const variant = line.variantId
        ? p.variants?.find((v) => String(v._id) === line.variantId)
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
    const shipping_cost = enriched.reduce((s, i) => s + (i.deliveryFee ?? 0) * i.qty, 0);
    const total = subtotal + shipping_cost;

    const order = await ordersRepo.create({
      userId: req.user?.sub,
      items: enriched,
      shipping: parsed.data.shipping,
      payment: { method: parsed.data.payment.method, status: 'pending' },
      subtotal,
      shipping_cost,
      total,
      notes: parsed.data.notes,
    });

    // Fire customer + admin notification emails without blocking the response.
    ordersRepo
      .byId(order._id, { withUser: true })
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
    const orders = await ordersRepo.listAll({ status, limit: Number(limit) });
    return ok(res, orders);
  } catch (e) {
    next(e);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await ordersRepo.listByUser(req.user.sub);
    return ok(res, orders);
  } catch (e) {
    next(e);
  }
}

export async function getOrder(req, res, next) {
  try {
    if (!isUuid(req.params.id)) throw notFound('Order not found');
    const order = await ordersRepo.byId(req.params.id, { withUser: true });
    if (!order) throw notFound('Order not found');
    const ownerId = order.user?._id ?? order.user;
    if (req.user?.role !== 'admin' && String(ownerId) !== req.user?.sub) {
      throw forbidden();
    }
    return ok(res, order);
  } catch (e) {
    next(e);
  }
}

export async function updateStatus(req, res, next) {
  try {
    if (!isUuid(req.params.id)) throw notFound('Order not found');
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) throw badRequest('Invalid status');
    const order = await ordersRepo.updateStatus(req.params.id, status);
    if (!order) throw notFound('Order not found');
    return ok(res, order);
  } catch (e) {
    next(e);
  }
}
