import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`[server] CoolZone API ready on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

start().catch((e) => {
  console.error('[server] Fatal startup error:', e);
  process.exit(1);
});
