import 'dotenv/config';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  role: 'patient' | 'doctor' | 'trial_investigator';
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error(
    'Missing required auth environment variables. Ensure JWT_SECRET and REFRESH_TOKEN_SECRET are set.',
  );
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET as jwt.Secret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const payload = jwt.verify(token, JWT_SECRET as jwt.Secret);

  if (typeof payload === 'string' || !payload || typeof payload !== 'object') {
    throw new Error('Invalid access token payload');
  }

  const typedPayload = payload as JwtPayload;

  if (!typedPayload.userId || !typedPayload.role) {
    throw new Error('Invalid access token payload');
  }

  return typedPayload;
}

export function verifyRefreshToken(token: string): string {
  const payload = jwt.verify(token, REFRESH_TOKEN_SECRET as jwt.Secret);

  if (typeof payload === 'string' || !payload || typeof payload !== 'object') {
    throw new Error('Invalid refresh token payload');
  }

  const typedPayload = payload as { userId?: string };

  if (!typedPayload.userId) {
    throw new Error('Invalid refresh token payload');
  }

  return typedPayload.userId;
}

export function getRefreshTokenExpiry(refreshToken: string): Date {
  const decoded = jwt.decode(refreshToken) as { exp?: number } | null;

  if (!decoded?.exp) {
    throw new Error('Unable to parse refresh token expiry');
  }

  return new Date(decoded.exp * 1000);
}
