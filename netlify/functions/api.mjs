// Netlify Function that serves the entire Express API.
//
// The `/api/*` redirect (see netlify.toml) rewrites requests to this function,
// so the whole CoolZone backend runs serverless on Netlify — no separate host.
// The backend talks to Supabase over HTTPS, so no persistent DB connection is
// needed. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, CLIENT_URL
// as Netlify environment variables.
import serverless from 'serverless-http';
import app from '../../backend/src/app.js';

const wrapped = serverless(app, { provider: 'aws' });

export async function handler(event, context) {
  // Normalize the path Netlify hands us back onto the Express `/api/*` routes.
  // Netlify may deliver either the original path or the rewritten function path.
  let path = event.path || '/';
  path = path.replace(/^\/\.netlify\/functions\/api/, '/api');
  if (!path.startsWith('/api')) {
    path = '/api' + (path === '/' ? '' : path);
  }
  event.path = path;
  return wrapped(event, context);
}
