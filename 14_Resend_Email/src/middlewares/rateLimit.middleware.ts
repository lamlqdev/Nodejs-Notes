import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Resend default limit is 2 req/s; this keeps well under that
export const emailLimiter = rateLimit({
  windowMs: 1000,
  max: 2,
  message: 'Email rate limit exceeded. Maximum 2 emails per second.',
  standardHeaders: true,
  legacyHeaders: false,
});
