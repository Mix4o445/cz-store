import { supabase, throwOnError } from '../config/supabase.js';
import { mapOrder } from './map.js';

const TABLE = 'orders';
const WITH_USER = '*, users(id, name, email)';
const REVENUE_STATUSES = ['confirmed', 'shipped', 'delivered'];

export const ordersRepo = {
  async create({ userId, items, shipping, payment, subtotal, shipping_cost, total, notes }) {
    const row = {
      user_id: userId ?? null,
      items,
      shipping,
      payment,
      subtotal,
      shipping_cost,
      total,
      notes: notes ?? null,
    };
    const { data, error } = await supabase.from(TABLE).insert(row).select('*').single();
    throwOnError(error, 'orders.create');
    return mapOrder(data);
  },

  async listAll({ status, limit = 100 } = {}) {
    let query = supabase
      .from(TABLE)
      .select(WITH_USER)
      .order('created_at', { ascending: false })
      .limit(Number(limit));
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    throwOnError(error, 'orders.listAll');
    return (data ?? []).map(mapOrder);
  },

  async listByUser(userId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    throwOnError(error, 'orders.listByUser');
    return (data ?? []).map(mapOrder);
  },

  async byId(id, { withUser = false } = {}) {
    const { data, error } = await supabase
      .from(TABLE)
      .select(withUser ? WITH_USER : '*')
      .eq('id', id)
      .maybeSingle();
    throwOnError(error, 'orders.byId');
    return data ? mapOrder(data) : null;
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ status })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    throwOnError(error, 'orders.updateStatus');
    return data ? mapOrder(data) : null;
  },

  async count() {
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });
    throwOnError(error, 'orders.count');
    return count ?? 0;
  },

  async revenue() {
    const { data, error } = await supabase
      .from(TABLE)
      .select('total')
      .in('status', REVENUE_STATUSES);
    throwOnError(error, 'orders.revenue');
    return (data ?? []).reduce((s, r) => s + Number(r.total ?? 0), 0);
  },

  async recent(limit = 8) {
    const { data, error } = await supabase
      .from(TABLE)
      .select(WITH_USER)
      .order('created_at', { ascending: false })
      .limit(limit);
    throwOnError(error, 'orders.recent');
    return (data ?? []).map(mapOrder);
  },
};
