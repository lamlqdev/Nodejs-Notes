import type { Request, Response } from 'express';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.util';
import { AppError } from '../middlewares/error.middleware';
import config from '../config/config';
import {
  createUser,
  verifyUserCredentials,
  findUserById,
} from '../services/user.service';

export async function signUpController(req: Request, res: Response) {
  const { email, password, name, phone, address } = req.body;

  // Create user through service layer (handles customer creation if role is 'user')
  const user = await createUser({
    email,
    password,
    name,
    phone,
    address,
    role: 'user', // Default role for signup
  });

  if (!user) {
    throw new AppError('Failed to create user', 500);
  }

  // Generate tokens
  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Set access token in HTTP-only cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: config.cookieMaxAge,
    path: '/',
  });

  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    refreshToken,
  });
}

export async function signInController(req: Request, res: Response) {
  const { email, password } = req.body;

  // Verify credentials through service layer
  const user = await verifyUserCredentials(email, password);

  // Generate tokens
  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Set access token in HTTP-only cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: config.cookieMaxAge,
    path: '/',
  });

  res.json({
    message: 'Sign in successful',
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    refreshToken,
  });
}

export function refreshTokenController(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  try {
    // Verify refresh token signature and expiration
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    // Set new access token in HTTP-only cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: config.cookieMaxAge,
      path: '/',
    });

    res.json({
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
}

export function logoutController(req: Request, res: Response) {
  // Clear access token cookie
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.json({
    message: 'Logged out successfully',
  });
}

export async function getMeController(req: Request, res: Response) {
  const user = await findUserById(req.user!.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
}
