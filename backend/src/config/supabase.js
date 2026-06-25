import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { env } from './env.js';

// The Express backend is the only trusted client of the database, so it uses
// the service-role key (bypasses Row-Level Security). This key must NEVER be
// exposed to the browser — it lives only in backend env vars.
if (!env.supabaseUrl || !env.supabaseServiceKey) {
  const msg = '[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY';
  if (env.isProd) throw new Error(msg);
  console.warn(msg + ' — DB calls will fail until set.');
}

export const supabase = createClient(
  env.supabaseUrl || 'http://localhost:54321',
  env.supabaseServiceKey || 'missing-service-key',
  {
    auth: { persistSession: false, autoRefreshToken: false },
    // Provide a WebSocket implementation so supabase-js's Realtime client works
    // on Node < 22 (e.g. Netlify Functions on Node 20), which lacks a global
    // WebSocket. We don't use Realtime, but the client constructs it eagerly.
    realtime: { transport: ws },
  }
);

/** Throw a normalized error from a Supabase response so the error handler can map it. */
export function throwOnError(error, context = 'db') {
  if (!error) return;
  const err = new Error(error.message || `Supabase error (${context})`);
  err.name = error.code === 'PGRST116' ? 'NotFound' : 'SupabaseError';
  err.code = error.code;
  err.details = error.details;
  throw err;
}
