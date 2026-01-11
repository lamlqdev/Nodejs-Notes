import app from './app';
import config from './config/config';
import { connectDB } from './config/database';
import logger from './utils/logger.util';

// Connect to database
connectDB().catch((error) => {
  logger.error('Failed to connect to database', { error });
  process.exit(1);
});

// Start server
app.listen(config.port, () => {
  logger.info('Server started successfully', {
    port: config.port,
    environment: config.nodeEnv,
    apiDocs: `http://localhost:${config.port}/api-docs`,
  });
});
