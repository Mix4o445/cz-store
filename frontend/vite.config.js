import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const DEFAULT_SITE_URL = 'https://www.coolzone.ma';

/** Resolve %VITE_*% placeholders in index.html with sensible fallbacks so
 *  the build never fails when an env var is missing (e.g. on Vercel preview
 *  builds that don't have VITE_SITE_URL set). */
function envPlaceholdersPlugin() {
  return {
    name: 'coolzone-env-placeholders',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const siteUrl = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
        const gsc = (process.env.VITE_GSC_VERIFICATION || '').trim();
        const gscMeta = gsc
          ? `<meta name="google-site-verification" content="${gsc.replace(/"/g, '&quot;')}" />`
          : '';
        return html
          .replaceAll('%VITE_SITE_URL%', siteUrl)
          .replaceAll('%VITE_GSC_VERIFICATION_META%', gscMeta);
      },
    },
  };
}

export default defineConfig({
  plugins: [envPlaceholdersPlugin(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
});
