import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import config from './config/config';
import { swaggerSpec } from './config/swagger.config';
import { errorHandler } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import emailRoutes from './routes/email.route';
import logger from './utils/logger.util';

const app = express();

app.use(loggerMiddleware);
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/emails', emailRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.use(errorHandler);

logger.info('Server initialized', {
  port: config.port,
  environment: config.nodeEnv,
});

export default app;
