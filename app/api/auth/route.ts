import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  verifyRefreshToken,
} from '@/lib/auth';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { action?: string; email?: string; password?: string; refreshToken?: string };
    const action = body.action?.toLowerCase();

    if (action === 'login') {
      const email = body.email?.trim();
      const password = body.password;

      if (!email || !password) {
        return jsonError('Email and password are required', 400);
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return jsonError('Invalid email or password', 401);
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        return jsonError('Invalid email or password', 401);
      }

      const accessToken = generateAccessToken({ userId: user.id, role: user.role });
      const refreshToken = generateRefreshToken(user.id);
      const expiresAt = getRefreshTokenExpiry(refreshToken);
      await prisma.refreshToken.create({
        data: { userId: user.id, token: refreshToken, expiresAt },
      });

      return NextResponse.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    }

    if (action === 'refresh') {
      const refreshToken = body.refreshToken;
      if (!refreshToken) {
        return jsonError('Refresh token is required', 400);
      }

      const userId = verifyRefreshToken(refreshToken);
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        return jsonError('Invalid refresh token', 401);
      }

      const accessToken = generateAccessToken({ userId, role: storedToken.user.role });
      return NextResponse.json({ accessToken });
    }

    if (action === 'logout') {
      const refreshToken = body.refreshToken;
      if (!refreshToken) {
        return jsonError('Refresh token is required', 400);
      }

      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, revoked: false },
        data: { revoked: true },
      });

      return NextResponse.json({ message: 'Logout successful' });
    }

    return jsonError('Unsupported auth action', 400);
  } catch (error) {
    console.error(error);
    return jsonError('Unable to process auth request', 500);
  }
}
