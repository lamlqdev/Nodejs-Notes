import { Router } from 'express';
import {
  signUpController,
  signInController,
  refreshSessionController,
  logoutController,
  getMeController,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Apply rate limiting to auth routes
router.post('/signup', authLimiter, signUpController);
router.post('/signin', authLimiter, signInController);
router.post('/refresh', authenticate, refreshSessionController);
router.post('/logout', logoutController);
router.get('/me', authenticate, getMeController);

export default router;

