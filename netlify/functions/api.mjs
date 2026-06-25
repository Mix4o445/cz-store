// Netlify Function that serves the entire Express API.
//
// The `/api/*` redirect (see netlify.toml) rewrites requests to this function,
// so the whole CoolZone backend runs serverless on Netlify — no separate host.
// The backend talks to Supabase over HTTPS, so no persistent DB connection is
// needed. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, CLIENT_URL
// as Netlify environment variables.
import serverless from 'serverless-http';

// Load the Express app at module init. If anything throws here (bad import,
// misconfig), capture it so the handler can report a clear JSON error rather
// than letting Netlify return an opaque 502.
let wrapped;
let initError = null;
try {
  const { default: app } = await import('../../backend/src/app.js');
  wrapped = serverless(app, { provider: 'aws' });
} catch (err) {
  initError = err;
  console.error('[fn] init failed:', err);
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

export async function handler(event, context) {
  if (initError) {
    return json(500, { success: false, message: 'Function init failed', error: initError.message });
  }
  try {
    // Normalize the path Netlify hands us back onto the Express `/api/*` routes.
    let path = event.path || '/';
    path = path.replace(/^\/\.netlify\/functions\/api/, '/api');
    if (!path.startsWith('/api')) {
      path = '/api' + (path === '/' ? '' : path);
    }
    event.path = path;
    return await wrapped(event, context);
  } catch (err) {
    console.error('[fn] handler error:', err);
    return json(500, { success: false, message: 'Function error', error: err.message });
  }
}
