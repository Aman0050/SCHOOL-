import * as jwt from 'jsonwebtoken';
import { SystemRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-enterprise-access-token-key-change-this-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-enterprise-refresh-token-key-change-this-in-production';

export interface TokenPayload {
  userId: string;
  email: string;
  role: SystemRole;
  tenantId: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};
