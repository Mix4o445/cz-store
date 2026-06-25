import 'dotenv/config';

const required = ['JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    const msg = `[env] Missing required env var: ${key}`;
    if (process.env.NODE_ENV === 'production') throw new Error(msg);
    console.warn(msg);
  }
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coolzone',
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
