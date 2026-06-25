import { z } from 'zod';
import { usersRepo } from '../db/users.repo.js';
import { comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/generateToken.js';
import { ok, created } from '../utils/apiResponse.js';
import { badRequest, conflict, unauthorized, notFound } from '../utils/apiError.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const passwordSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(6),
});

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());
    const { name, email, password, phone } = parsed.data;

    if (await usersRepo.emailExists(email)) throw conflict('Email already registered');

    const user = await usersRepo.create({ name, email, password, phone });
    const token = generateToken({ sub: user._id.toString(), role: user.role });
    setAuthCookie(res, token);
    return created(res, { user, token }, 'Account created');
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());
    const { email, password } = parsed.data;

    const user = await usersRepo.findByEmail(email, { withPassword: true });
    if (!user) throw unauthorized('Invalid credentials');

    const match = await comparePassword(password, user.password);
    if (!match) throw unauthorized('Invalid credentials');

    delete user.password;
    const token = generateToken({ sub: user._id.toString(), role: user.role });
    setAuthCookie(res, token);
    return ok(res, { user, token }, 'Logged in');
  } catch (e) {
    next(e);
  }
}

export async function logout(_req, res, next) {
  try {
    res.clearCookie('token');
    return ok(res, null, 'Logged out');
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    const user = await usersRepo.findById(req.user.sub);
    if (!user) throw notFound('User not found');
    return ok(res, user);
  } catch (e) {
    next(e);
  }
}

export async function changePassword(req, res, next) {
  try {
    const parsed = passwordSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());
    const user = await usersRepo.findById(req.user.sub, { withPassword: true });
    if (!user) throw notFound('User not found');
    const match = await comparePassword(parsed.data.current, user.password);
    if (!match) throw unauthorized('Current password is incorrect');
    await usersRepo.updatePassword(user._id, parsed.data.next);
    return ok(res, null, 'Password updated');
  } catch (e) {
    next(e);
  }
}
