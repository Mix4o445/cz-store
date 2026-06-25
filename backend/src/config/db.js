import { supabase } from './supabase.js';
import { env } from './env.js';

// With Supabase there is no persistent connection to open like Mongoose — the
// client is stateless over HTTPS. We do a lightweight probe at boot so startup
// logs clearly show whether the database is reachable and configured.
export async function connectDB() {
  if (!env.supabaseUrl || !env.supabaseServiceKey) {
    console.warn('[db] Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing)');
    if (env.isProd) process.exit(1);
    return;
  }
  try {
    const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' });
    if (error) throw error;
    console.log('[db] Supabase connected');
  } catch (err) {
    console.error('[db] Supabase connection failed:', err.message);
    if (env.isProd) process.exit(1);
    // In dev keep the server up so the UI can render and surface clear errors.
  }
}
