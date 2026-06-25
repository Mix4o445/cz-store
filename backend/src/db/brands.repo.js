import { supabase, throwOnError } from '../config/supabase.js';
import { mapBrand, brandToRow, makeSlug } from './map.js';

const TABLE = 'brands';

export const brandsRepo = {
  async list() {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('order', { ascending: true })
      .order('name', { ascending: true });
    throwOnError(error, 'brands.list');
    return (data ?? []).map(mapBrand);
  },

  async byId(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    throwOnError(error, 'brands.byId');
    return mapBrand(data);
  },

  async create(data) {
    const row = brandToRow(data);
    if (!row.slug && data.name) row.slug = makeSlug(data.name);
    const { data: created, error } = await supabase.from(TABLE).insert(row).select('*').single();
    throwOnError(error, 'brands.create');
    return mapBrand(created);
  },

  async updateById(id, data) {
    const row = brandToRow(data);
    const { data: updated, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    throwOnError(error, 'brands.updateById');
    return mapBrand(updated);
  },

  async deleteById(id) {
    const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select('*').maybeSingle();
    throwOnError(error, 'brands.deleteById');
    return mapBrand(data);
  },

  async count() {
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });
    throwOnError(error, 'brands.count');
    return count ?? 0;
  },
};
