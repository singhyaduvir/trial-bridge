import * as express from 'express';
import * as bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  saveRefreshToken,
  verifyRefreshToken,
} from '../services/authService';

const router = express.Router();

function sendError(res: express.Response, status: number, message: string) {
  return res.status(status).json({ error: message });
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user.id);
    const expiresAt = getRefreshTokenExpiry(refreshToken);

    await saveRefreshToken(user.id, refreshToken, expiresAt);

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Unable to process login');
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (!refreshToken) {
      return sendError(res, 400, 'Refresh token is required');
    }

    const userId = verifyRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      return sendError(res, 401, 'Invalid refresh token');
    }

    const accessToken = generateAccessToken({
      userId,
      role: storedToken.user.role,
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error(error);
    return sendError(res, 401, 'Invalid or expired refresh token');
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (!refreshToken) {
      return sendError(res, 400, 'Refresh token is required');
    }

    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, revoked: false },
      data: { revoked: true },
    });

    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Unable to log out');
  }
});

export default router;
