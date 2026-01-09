import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { users, type User } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password.util';
import { AppError } from '../middlewares/error.middleware';

// Extend Express Session type
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    email?: string;
    isAuthenticated?: boolean;
  }
}

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

  // Create session
  req.session.userId = newUser.id;
  req.session.email = newUser.email;
  req.session.isAuthenticated = true;

  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    },
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

  // Create session
  req.session.userId = user.id;
  req.session.email = user.email;
  req.session.isAuthenticated = true;

  res.json({
    message: 'Sign in successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

// Refresh Session (extend expiration)
export function refreshSessionController(req: Request, res: Response) {
  if (!req.session || !req.session.isAuthenticated) {
    throw new AppError('Not authenticated', 401);
  }

  // Extend session expiration
  req.session.cookie.maxAge = req.session.cookie.originalMaxAge || undefined;
  req.session.touch(); // Update last access time

  res.json({
    message: 'Session refreshed successfully',
  });
}

// Logout
export function logoutController(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      throw new AppError('Failed to logout', 500);
    }

    res.clearCookie('connect.sid'); // Default session cookie name
    res.json({
      message: 'Logged out successfully',
    });
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
