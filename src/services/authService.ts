import * as jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig';
import type { JwtPayload } from '../types/auth';
import { prisma } from '../../lib/prisma';

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, authConfig.jwtSecret as jwt.Secret, {
    expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, authConfig.refreshTokenSecret as jwt.Secret, {
    expiresIn: authConfig.refreshTokenExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export async function saveRefreshToken(userId: string, token: string, expiresAt: Date) {
  return prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const payload = jwt.verify(token, authConfig.jwtSecret as jwt.Secret);

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
  const payload = jwt.verify(token, authConfig.refreshTokenSecret as jwt.Secret);

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
