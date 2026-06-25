import { supabase, throwOnError } from '../config/supabase.js';
import { mapProduct, productToRow, ensureIds, parseSort, makeProductSlug } from './map.js';

const TABLE = 'products';

/** Apply the same filters the old Mongoose listProducts built. */
function applyFilters(query, filter = {}) {
  if (filter.brand) query = query.eq('brand', filter.brand);
  if (filter.category) query = query.eq('category', filter.category);
  if (filter.tag) query = query.contains('tags', [filter.tag]);
  if (filter.isPromo) query = query.eq('is_promo', true);
  if (filter.isFeatured) query = query.eq('is_featured', true);
  if (filter.minPrice != null) query = query.gte('price', filter.minPrice);
  if (filter.maxPrice != null) query = query.lte('price', filter.maxPrice);
  if (filter.q) {
    const term = String(filter.q).replace(/[,()]/g, ' ').trim();
    query = query.or(`name->>fr.ilike.%${term}%,name->>ar.ilike.%${term}%,brand.ilike.%${term}%`);
  }
  return query;
}

export const productsRepo = {
  async list({ filter = {}, sort = '-createdAt', skip = 0, limit = 24 } = {}) {
    const { column, ascending } = parseSort(sort);
    let query = supabase.from(TABLE).select('*').order(column, { ascending });
    query = applyFilters(query, filter);
    query = query.range(Number(skip), Number(skip) + Number(limit) - 1);
    const { data, error } = await query;
    throwOnError(error, 'products.list');
    return (data ?? []).map(mapProduct);
  },

  async count(filter = {}) {
    let query = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    query = applyFilters(query, filter);
    const { count, error } = await query;
    throwOnError(error, 'products.count');
    return count ?? 0;
  },

  async featured(limit = 8) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('is_featured', true)
      .limit(limit);
    throwOnError(error, 'products.featured');
    return (data ?? []).map(mapProduct);
  },

  async distinctTags() {
    const { data, error } = await supabase.from(TABLE).select('tags');
    throwOnError(error, 'products.distinctTags');
    const set = new Set();
    for (const row of data ?? []) for (const t of row.tags ?? []) if (t) set.add(t);
    return [...set].sort();
  },

  async byIds(ids = []) {
    if (!ids.length) return [];
    const { data, error } = await supabase.from(TABLE).select('*').in('id', ids);
    throwOnError(error, 'products.byIds');
    return (data ?? []).map(mapProduct);
  },

  async bySlug(slug) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('slug', slug).maybeSingle();
    throwOnError(error, 'products.bySlug');
    return mapProduct(data);
  },

  async byId(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    throwOnError(error, 'products.byId');
    return mapProduct(data);
  },

  async create(data) {
    const row = productToRow(data);
    if (!row.slug) row.slug = makeProductSlug(data.name?.fr ?? 'product');
    if (row.variants) row.variants = ensureIds(row.variants);
    const { data: created, error } = await supabase.from(TABLE).insert(row).select('*').single();
    throwOnError(error, 'products.create');
    return mapProduct(created);
  },

  async updateById(id, data) {
    const row = productToRow(data);
    if (row.variants) row.variants = ensureIds(row.variants);
    const { data: updated, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    throwOnError(error, 'products.updateById');
    return mapProduct(updated);
  },

  async deleteById(id) {
    const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select('*').maybeSingle();
    throwOnError(error, 'products.deleteById');
    return mapProduct(data);
  },

  async setRating(id, { rating, numReviews }) {
    const { error } = await supabase
      .from(TABLE)
      .update({ rating, num_reviews: numReviews })
      .eq('id', id);
    throwOnError(error, 'products.setRating');
  },

  async lowStock(limit = 6, threshold = 3) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .lte('stock', threshold)
      .order('stock', { ascending: true })
      .limit(limit);
    throwOnError(error, 'products.lowStock');
    return (data ?? []).map(mapProduct);
  },

  async count_all() {
    return this.count({});
  },
};
