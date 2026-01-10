import { Router } from 'express';
import {
  signUpController,
  signInController,
  refreshTokenController,
  logoutController,
  getMeController,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import { validate } from '../middlewares/validation.middleware';
import { signUpSchema, signInSchema } from '../validations/user.validation';

const router = Router();

// Apply rate limiting and validation to auth routes
router.post('/signup', authLimiter, validate(signUpSchema), signUpController);
router.post('/signin', authLimiter, validate(signInSchema), signInController);
router.post('/refresh', authLimiter, refreshTokenController);
router.post('/logout', logoutController);
router.get('/me', authenticate, getMeController);

export default router;
