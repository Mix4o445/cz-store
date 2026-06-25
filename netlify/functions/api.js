// Netlify Function that serves the entire Express API.
//
// Authored as CommonJS: Netlify wraps functions in a CJS shim that `require()`s
// this file, and require() cannot load ES modules. The backend Express app is
// ESM, so we load it with a dynamic import() (allowed from CommonJS).
//
// The `/api/*` redirect (netlify.toml) rewrites requests here, so the whole
// CoolZone backend runs serverless on Netlify. It talks to Supabase over HTTPS.
// Required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, CLIENT_URL.
const serverless = require('serverless-http');

let wrappedPromise = null;
function getWrapped() {
  if (!wrappedPromise) {
    wrappedPromise = import('../../backend/src/app.js').then(({ default: app }) =>
      serverless(app, { provider: 'aws' })
    );
  }
  return wrappedPromise;
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

exports.handler = async (event, context) => {
  try {
    const wrapped = await getWrapped();
    // Normalize the path Netlify hands us back onto the Express `/api/*` routes.
    let path = event.path || '/';
    path = path.replace(/^\/\.netlify\/functions\/api/, '/api');
    if (!path.startsWith('/api')) {
      path = '/api' + (path === '/' ? '' : path);
    }
    event.path = path;
    return await wrapped(event, context);
  } catch (err) {
    console.error('[fn] error:', err);
    return json(500, { success: false, message: 'Function error', error: err.message });
  }
};
