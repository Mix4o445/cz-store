import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/** Replace the %VITE_GSC_VERIFICATION_META% placeholder in index.html with
 *  a google-site-verification meta tag, or an empty string when unset. */
function googleSiteVerificationPlugin() {
  return {
    name: 'coolzone-google-site-verification',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const code = (process.env.VITE_GSC_VERIFICATION || '').trim();
        const meta = code
          ? `<meta name="google-site-verification" content="${code.replace(/"/g, '&quot;')}" />`
          : '';
        return html.replaceAll('%VITE_GSC_VERIFICATION_META%', meta);
      },
    },
  };
}

export default defineConfig({
  plugins: [googleSiteVerificationPlugin(), react()],
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
