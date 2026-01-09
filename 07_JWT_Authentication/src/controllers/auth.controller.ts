import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { users, type User } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';
import { AppError } from '../middlewares/error.middleware';
import config from '../config/config';

// In-memory refresh tokens storage
const refreshTokens: string[] = [];

// Sign Up
export async function signUpController(req: Request, res: Response) {
  const { email, password, name } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Check if user exists
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    throw new AppError('User already exists', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const newUser: User = {
    id: uuidv4(),
    email,
    password: hashedPassword,
    name: name || '',
    createdAt: new Date(),
  };

  users.push(newUser);

  // Generate tokens
  const tokenPayload = { userId: newUser.id, email: newUser.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token
  refreshTokens.push(refreshToken);

  // Set access token in HTTP-only cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production', // Only send over HTTPS in production
    sameSite: 'strict',
    maxAge: config.cookieMaxAge,
    path: '/',
  });

  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    },
    refreshToken, // Only send refresh token in response body
  });
}

// Sign In
export async function signInController(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Find user
  const user = users.find((u) => u.email === email);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate tokens
  const tokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token
  refreshTokens.push(refreshToken);

  // Set access token in HTTP-only cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production', // Only send over HTTPS in production
    sameSite: 'strict',
    maxAge: config.cookieMaxAge,
    path: '/',
  });

  res.json({
    message: 'Sign in successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    refreshToken, // Only send refresh token in response body
  });
}

// Refresh Token
export function refreshTokenController(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  // Check if refresh token exists
  if (!refreshTokens.includes(refreshToken)) {
    throw new AppError('Invalid refresh token', 401);
  }

  try {
    const { verifyRefreshToken } = require('../utils/jwt.util');
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token
    const { generateAccessToken } = require('../utils/jwt.util');
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
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

// Logout
export function logoutController(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const index = refreshTokens.indexOf(refreshToken);
    if (index > -1) {
      refreshTokens.splice(index, 1);
    }
  }

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

// Get current user (protected route)
export function getMeController(req: Request, res: Response) {
  const user = users.find((u) => u.id === req.user?.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
  });
}
