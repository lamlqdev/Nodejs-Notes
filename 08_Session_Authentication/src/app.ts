import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import { errorHandler } from './middlewares/error.middleware';
import { logger } from './middlewares/logger.middleware';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import config from './config/config';
import authRoutes from './routes/auth.route';

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

// Redis client configuration
const redisClientConfig: {
  socket: { host: string; port: number };
  password?: string;
} = {
  socket: {
    host: config.redisHost,
    port: config.redisPort,
  },
};

if (config.redisPassword) {
  redisClientConfig.password = config.redisPassword;
}

const redisClient = createClient(redisClientConfig);

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect to Redis (will be awaited in server.ts)
redisClient.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
  process.exit(1);
});

// Session configuration with Redis store
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Custom session cookie name
    cookie: {
      httpOnly: true,
      secure: config.nodeEnv === 'production', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: config.sessionMaxAge,
    },
  })
);

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;

