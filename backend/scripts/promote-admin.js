/**
 * Promote a user to admin role.
 *
 * Usage:
 *   npm run promote-admin -- user@example.com
 *   node scripts/promote-admin.js user@example.com [--demote]
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models/User.model.js';

const args = process.argv.slice(2);
const demote = args.includes('--demote');
const email = args.find((a) => !a.startsWith('--'));

if (!email) {
  console.error('Usage: npm run promote-admin -- <email> [--demote]');
  process.exit(1);
}

const role = demote ? 'user' : 'admin';
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coolzone';

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role },
    { new: true }
  );
  if (!user) {
    console.error(`No user found with email "${email}".`);
    process.exit(2);
  }
  console.log(`✓ ${user.email} is now '${user.role}'.`);
  console.log('  → Sign out and sign back in for the new role to take effect.');
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error('Promote failed:', err.message);
  process.exit(1);
}
