import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function generateToken(payload, options = {}) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn, ...options });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
