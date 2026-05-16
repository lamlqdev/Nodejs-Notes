import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  redis: {
    host: string;
    port: number;
  };
  resendApiKey: string;
  fromEmail: string;
  fromName: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  resendApiKey: requireEnv('RESEND_API_KEY'),
  fromEmail: process.env.FROM_EMAIL || 'onboarding@resend.dev',
  fromName: process.env.FROM_NAME || 'Job Board',
};

export default config;
