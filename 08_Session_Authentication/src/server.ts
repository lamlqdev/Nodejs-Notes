import app from './app';
import config from './config/config';

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Redis: ${config.redisHost}:${config.redisPort}`);
});

