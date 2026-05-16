import app from './app';
import config from './config/config';
import logger from './utils/logger.util';

app.listen(config.port, () => {
  logger.info('Server started successfully', {
    port: config.port,
    environment: config.nodeEnv,
    apiDocs: `http://localhost:${config.port}/api-docs`,
  });
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
