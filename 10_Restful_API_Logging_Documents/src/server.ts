import app from './app';
import config from './config/config';
import { connectDB, disconnectDB } from './config/database';
import logger from './utils/logger.util';

// Connect to database
connectDB()
  .then(() => {
    logger.info('Connected to MongoDB successfully');

    // Start server
    app.listen(config.port, () => {
      logger.info('Server started successfully', {
        port: config.port,
        environment: config.nodeEnv,
        apiDocs: `http://localhost:${config.port}/api-docs`,
      });
    });
  })
  .catch((error) => {
    logger.error('Failed to connect to database', { error });
    process.exit(1);
  });

// Disconnect from database on shutdown
const gracefulShutdown = async (signal: string) => {
  try {
    await disconnectDB();
    logger.info('Disconnected from MongoDB successfully');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', { error });
  }
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
