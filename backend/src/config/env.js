import 'dotenv/config';

const required = ['JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    // Warn but never throw at import time — in a serverless function a thrown
    // module-init error becomes an opaque 502. The app stays up and surfaces a
    // clear error instead.
    console.warn(`[env] Missing required env var: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coolzone',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'CoolZone <noreply@coolzone.ma>',
  },
  adminEmail: process.env.ADMIN_EMAIL || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
};
