import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, revoked: false },
      data: { revoked: true },
    });

    return NextResponse.json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    return jsonError('Unable to process logout', 500);
  }
}
