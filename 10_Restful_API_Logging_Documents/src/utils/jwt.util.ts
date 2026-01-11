import jwt, { type SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import config from '../config/config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as StringValue,
  };
  return jwt.sign(payload, config.jwtSecret, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwtRefreshExpiresIn as StringValue,
  };
  return jwt.sign(payload, config.jwtRefreshSecret, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    if (typeof decoded === 'string') {
      throw new Error('Invalid token format');
    }

    if (!decoded.userId || !decoded.email || !decoded.role) {
      throw new Error('Invalid token payload');
    }

    return {
      userId: decoded.userId as string,
      email: decoded.email as string,
      role: decoded.role as 'admin' | 'user',
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw error;
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret);

    if (typeof decoded === 'string') {
      throw new Error('Invalid token format');
    }

    if (!decoded.userId || !decoded.email || !decoded.role) {
      throw new Error('Invalid token payload');
    }

    return {
      userId: decoded.userId as string,
      email: decoded.email as string,
      role: decoded.role as 'admin' | 'user',
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    throw error;
  }
}
