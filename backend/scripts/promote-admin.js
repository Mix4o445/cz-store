/**
 * Promote a user to admin role (Supabase).
 *
 * Usage:
 *   npm run promote-admin -- user@example.com
 *   node scripts/promote-admin.js user@example.com [--demote]
 */
import 'dotenv/config';
import { supabase } from '../src/config/supabase.js';

const args = process.argv.slice(2);
const demote = args.includes('--demote');
const email = args.find((a) => !a.startsWith('--'));

if (!email) {
  console.error('Usage: npm run promote-admin -- <email> [--demote]');
  process.exit(1);
}

const role = demote ? 'user' : 'admin';

try {
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('email', email.toLowerCase())
    .select('email, role')
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    console.error(`No user found with email "${email}".`);
    process.exit(2);
  }
  console.log(`✓ ${data.email} is now '${data.role}'.`);
  console.log('  → Sign out and sign back in for the new role to take effect.');
  process.exit(0);
} catch (err) {
  console.error('Promote failed:', err.message);
  process.exit(1);
}
