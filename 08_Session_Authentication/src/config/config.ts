import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  sessionSecret: string;
  sessionMaxAge: number;
  corsOrigin: string;
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: requireEnv('SESSION_SECRET'),
  sessionMaxAge: Number(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: Number(process.env.REDIS_PORT) || 6379,
  redisPassword: process.env.REDIS_PASSWORD,
};

export default config;

