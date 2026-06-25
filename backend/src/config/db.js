import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);
// Don't buffer model commands when not connected — fail fast so the API
// responds quickly instead of hanging until bufferTimeoutMS.
mongoose.set('bufferCommands', false);

mongoose.connection.on('connected', () => console.log('[db] connected'));
mongoose.connection.on('disconnected', () => console.warn('[db] disconnected'));
mongoose.connection.on('error', (err) => console.error('[db] error:', err.message));

export async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    console.error('[db] initial connection failed:', err.message);
    if (env.isProd) process.exit(1);
    // In dev: keep server up so UI can still render and we can show clear errors.
    // Mongoose will keep retrying in the background.
  }
}
