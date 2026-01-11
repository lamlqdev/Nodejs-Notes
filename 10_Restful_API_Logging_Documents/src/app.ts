import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import config from './config/config';
import { swaggerSpec } from './config/swagger.config';

import { errorHandler } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { apiLimiter } from './middlewares/rateLimit.middleware';

import authRoutes from './routes/auth.route';
import productRoutes from './routes/product.route';

import logger from './utils/logger.util';

const app = express();

// Request logging with Winston
app.use(loggerMiddleware);

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

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Global error handler (should be after routes)
app.use(errorHandler);

// Log server startup
logger.info('Server initialized', {
  port: config.port,
  environment: config.nodeEnv,
});

export default app;
