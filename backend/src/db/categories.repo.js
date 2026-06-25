import { supabase, throwOnError } from '../config/supabase.js';
import { mapCategory, categoryToRow, makeSlug } from './map.js';

const TABLE = 'categories';

export const categoriesRepo = {
  async list() {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('order', { ascending: true })
      .order('created_at', { ascending: true });
    throwOnError(error, 'categories.list');
    return (data ?? []).map(mapCategory);
  },

  async bySlug(slug) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('slug', slug).maybeSingle();
    throwOnError(error, 'categories.bySlug');
    return mapCategory(data);
  },

  async byId(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    throwOnError(error, 'categories.byId');
    return mapCategory(data);
  },

  async create(data) {
    const row = categoryToRow(data);
    if (!row.slug && data.name?.fr) row.slug = makeSlug(data.name.fr);
    const { data: created, error } = await supabase.from(TABLE).insert(row).select('*').single();
    throwOnError(error, 'categories.create');
    return mapCategory(created);
  },

  async updateById(id, data) {
    const row = categoryToRow(data);
    const { data: updated, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    throwOnError(error, 'categories.updateById');
    return mapCategory(updated);
  },

  async deleteById(id) {
    const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select('*').maybeSingle();
    throwOnError(error, 'categories.deleteById');
    return mapCategory(data);
  },

  async count() {
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });
    throwOnError(error, 'categories.count');
    return count ?? 0;
  },
};
