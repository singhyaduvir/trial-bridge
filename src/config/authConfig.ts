import 'dotenv/config';

interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
}

const { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN } = process.env;

if (!JWT_SECRET || !JWT_EXPIRES_IN || !REFRESH_TOKEN_SECRET || !REFRESH_TOKEN_EXPIRES_IN) {
  throw new Error(
    'Missing required auth environment variables. Ensure JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_SECRET, and REFRESH_TOKEN_EXPIRES_IN are set.',
  );
}

export const authConfig: AuthConfig = {
  jwtSecret: JWT_SECRET,
  jwtExpiresIn: JWT_EXPIRES_IN,
  refreshTokenSecret: REFRESH_TOKEN_SECRET,
  refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
};
