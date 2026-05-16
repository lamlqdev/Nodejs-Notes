import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import config from './config/config';
import { swaggerSpec } from './config/swagger.config';
import { errorHandler } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import roomRoutes from './routes/room.route';
import healthRoutes from './routes/health.route';
import logger from './utils/logger.util';

const app = express();

app.use(loggerMiddleware);
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting on all non-SSE routes (SSE is a persistent stream, not per-request)
app.use('/api/rooms', apiLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/rooms', roomRoutes);
app.use('/api/health', healthRoutes);

app.use(errorHandler);

logger.info('Express app initialized', { port: config.port, env: config.nodeEnv });

export default app;
