// Vercel Serverless Function that serves the entire CoolZone Express API.
//
// Vercel's Node runtime passes native (req, res) objects, and an Express app
// is itself a (req, res) handler — so we can export the app directly (no
// serverless-http wrapper needed, unlike the Netlify build).
//
// vercel.json rewrites /api/* to this function; the original URL (e.g.
// /api/auth/register) is preserved, so the Express routes match as-is.
//
// Required env vars (set in the Vercel dashboard):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, CLIENT_URL
import app from '../backend/src/app.js';

export default app;
