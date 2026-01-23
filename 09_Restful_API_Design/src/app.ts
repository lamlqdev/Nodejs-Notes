import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import config from './config/config';
import authRoutes from './routes/auth.route';
import productRoutes from './routes/product.route';

import { logger } from './middlewares/logger.middleware';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import { AppError, errorHandler } from './middlewares/error.middleware';

const app = express();

// Request logging
app.use(logger);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true, // Allow cookies to be sent
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser(config.cookieSecret));

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// 404 Not Found
app.use((req, res, next) => {
  next(new AppError("Route not found", 404));
});

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
