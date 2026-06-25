import bcrypt from 'bcryptjs';

// Mongoose hashed passwords in a pre-save hook; with Supabase we hash explicitly
// in the data layer so controllers never touch raw bcrypt.
export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash || '');
}
