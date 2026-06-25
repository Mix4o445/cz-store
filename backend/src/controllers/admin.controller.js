import { z } from 'zod';
import { usersRepo } from '../db/users.repo.js';
import { productsRepo } from '../db/products.repo.js';
import { ordersRepo } from '../db/orders.repo.js';
import { brandsRepo } from '../db/brands.repo.js';
import { categoriesRepo } from '../db/categories.repo.js';
import { ok } from '../utils/apiResponse.js';
import { badRequest, notFound } from '../utils/apiError.js';
import { isUuid } from '../utils/ids.js';

const roleSchema = z.object({ role: z.enum(['user', 'admin']) });

export async function listUsers(req, res, next) {
  try {
    const { q = '', limit = 50 } = req.query;
    const users = await usersRepo.list({ q, limit: Number(limit) });
    return ok(res, users);
  } catch (e) {
    next(e);
  }
}

export async function setUserRole(req, res, next) {
  try {
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid role');
    if (!isUuid(req.params.id)) throw notFound('User not found');

    if (req.params.id === req.user.sub && parsed.data.role !== 'admin') {
      throw badRequest('You cannot demote yourself');
    }

    const user = await usersRepo.updateById(req.params.id, { role: parsed.data.role });
    if (!user) throw notFound('User not found');
    return ok(res, user, 'Role updated');
  } catch (e) {
    next(e);
  }
}

export async function dashboardStats(_req, res, next) {
  try {
    const [usersCount, productsCount, ordersCount, brandsCount, categoriesCount, revenue, recentOrders, lowStock] =
      await Promise.all([
        usersRepo.count(),
        productsRepo.count({}),
        ordersRepo.count(),
        brandsRepo.count(),
        categoriesRepo.count(),
        ordersRepo.revenue(),
        ordersRepo.recent(8),
        productsRepo.lowStock(6),
      ]);

    return ok(res, {
      counts: {
        users: usersCount,
        products: productsCount,
        orders: ordersCount,
        brands: brandsCount,
        categories: categoriesCount,
      },
      revenue,
      recentOrders,
      lowStock,
    });
  } catch (e) {
    next(e);
  }
}
