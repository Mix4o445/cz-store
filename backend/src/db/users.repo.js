import { supabase, throwOnError } from '../config/supabase.js';
import { mapUser, ensureIds } from './map.js';
import { hashPassword } from '../utils/password.js';

const TABLE = 'users';

function userToRow(d = {}) {
  const row = {};
  if (d.name !== undefined) row.name = d.name;
  if (d.email !== undefined) row.email = String(d.email).toLowerCase().trim();
  if (d.phone !== undefined) row.phone = d.phone || null;
  if (d.role !== undefined) row.role = d.role;
  if (d.addresses !== undefined) row.addresses = ensureIds(d.addresses);
  if (d.password !== undefined) row.password = d.password;
  return row;
}

export const usersRepo = {
  async findByEmail(email, { withPassword = false } = {}) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('email', String(email).toLowerCase().trim())
      .maybeSingle();
    throwOnError(error, 'users.findByEmail');
    return mapUser(data, { withPassword });
  },

  async findById(id, { withPassword = false } = {}) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    throwOnError(error, 'users.findById');
    return mapUser(data, { withPassword });
  },

  /** Raw row incl. password + addresses — used for address mutations. */
  async _rawById(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    throwOnError(error, 'users._rawById');
    return data;
  },

  async create({ name, email, password, phone }) {
    const row = userToRow({ name, email, phone });
    row.password = await hashPassword(password);
    const { data, error } = await supabase.from(TABLE).insert(row).select('*').single();
    throwOnError(error, 'users.create');
    return mapUser(data);
  },

  async updateById(id, fields) {
    const row = userToRow(fields);
    const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select('*').maybeSingle();
    throwOnError(error, 'users.updateById');
    return mapUser(data);
  },

  /** Replace the addresses array wholesale (callers manage the array). */
  async setAddresses(id, addresses) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ addresses: ensureIds(addresses) })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    throwOnError(error, 'users.setAddresses');
    return mapUser(data);
  },

  async updatePassword(id, plain) {
    const password = await hashPassword(plain);
    const { error } = await supabase.from(TABLE).update({ password }).eq('id', id);
    throwOnError(error, 'users.updatePassword');
  },

  async list({ q = '', limit = 50 } = {}) {
    let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false }).limit(Number(limit));
    if (q) {
      const term = String(q).replace(/[,()]/g, ' ').trim();
      query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`);
    }
    const { data, error } = await query;
    throwOnError(error, 'users.list');
    return (data ?? []).map((r) => mapUser(r));
  },

  async emailExists(email, exceptId) {
    let query = supabase.from(TABLE).select('id').eq('email', String(email).toLowerCase().trim());
    if (exceptId) query = query.neq('id', exceptId);
    const { data, error } = await query.maybeSingle();
    throwOnError(error, 'users.emailExists');
    return !!data;
  },

  async count() {
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });
    throwOnError(error, 'users.count');
    return count ?? 0;
  },
};
