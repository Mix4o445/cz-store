import { z } from 'zod';
import { User } from '../models/User.model.js';
import { Product } from '../models/Product.model.js';
import { Order } from '../models/Order.model.js';
import { Brand } from '../models/Brand.model.js';
import { Category } from '../models/Category.model.js';
import { ok } from '../utils/apiResponse.js';
import { badRequest, notFound } from '../utils/apiError.js';

const roleSchema = z.object({ role: z.enum(['user', 'admin']) });

export async function listUsers(req, res, next) {
  try {
    const { q = '', limit = 50 } = req.query;
    const filter = q
      ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] }
      : {};
    const users = await User.find(filter).sort('-createdAt').limit(Number(limit));
    return ok(res, users);
  } catch (e) {
    next(e);
  }
}

export async function setUserRole(req, res, next) {
  try {
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid role');

    if (req.params.id === req.user.sub && parsed.data.role !== 'admin') {
      throw badRequest('You cannot demote yourself');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: parsed.data.role },
      { new: true, runValidators: true }
    );
    if (!user) throw notFound('User not found');
    return ok(res, user, 'Role updated');
  } catch (e) {
    next(e);
  }
}

export async function dashboardStats(_req, res, next) {
  try {
    const [usersCount, productsCount, ordersCount, brandsCount, categoriesCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Brand.countDocuments(),
      Category.countDocuments(),
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(8)
      .populate('user', 'name email');

    const lowStock = await Product.find({ stock: { $lte: 3 } })
      .sort('stock')
      .limit(6)
      .select('name slug stock images brand');

    return ok(res, {
      counts: {
        users: usersCount,
        products: productsCount,
        orders: ordersCount,
        brands: brandsCount,
        categories: categoriesCount,
      },
      revenue: revenueAgg[0]?.total ?? 0,
      recentOrders,
      lowStock,
    });
  } catch (e) {
    next(e);
  }
}
