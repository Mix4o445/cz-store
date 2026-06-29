import { supabase } from '../config/supabase.js';

const TABLE = 'agent_memory';

// True when the failure is "table doesn't exist yet" — lets the agent keep
// working (without memory) until the user runs the agent_memory migration.
function isMissingTable(error) {
  if (!error) return false;
  const msg = String(error.message || '');
  return error.code === '42P01' || /relation .*agent_memory.* does not exist|could not find the table/i.test(msg);
}

export const agentMemoryRepo = {
  async list(limit = 100) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      if (isMissingTable(error)) return { items: [], missing: true };
      throw new Error(error.message);
    }
    return { items: (data ?? []).map((r) => ({ id: r.id, content: r.content })), missing: false };
  },

  async add(content) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ content })
      .select('*')
      .single();
    if (error) {
      if (isMissingTable(error)) return { missing: true };
      throw new Error(error.message);
    }
    return { id: data.id, content: data.content };
  },

  async remove(id) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) {
      if (isMissingTable(error)) return { missing: true };
      throw new Error(error.message);
    }
    return { ok: true };
  },
};
