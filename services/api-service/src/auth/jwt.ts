import jwt from 'jsonwebtoken';
import { env } from '../env';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generates a JWT token for a user
 */
export function generateToken(user: { userId: string; email: string }): string {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const payload: JWTPayload = {
    userId: user.userId,
    email: user.email,
  };

  // Token expires in 7 days
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: '7d',
  });
}

/**
 * Verifies and decodes a JWT token
 */
export function verifyToken(token: string): JWTPayload {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.verify(token, env.jwtSecret) as JWTPayload;
}
