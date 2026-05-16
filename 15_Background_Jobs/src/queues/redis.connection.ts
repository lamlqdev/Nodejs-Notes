import IORedis from 'ioredis';
import config from '../config/config';
import logger from '../utils/logger.util';

// Single shared Redis connection reused by Queue, Worker, and QueueEvents
export const redisConnection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null, // required by BullMQ
});

redisConnection.on('connect', () => logger.info('Redis connected'));
redisConnection.on('error', (err) => logger.error('Redis error', { error: err.message }));
