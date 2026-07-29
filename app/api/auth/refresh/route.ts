import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, verifyRefreshToken } from '@/lib/auth';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { refreshToken?: string };
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
  } catch (error) {
    console.error(error);
    return jsonError('Invalid or expired refresh token', 401);
  }
}
