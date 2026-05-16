import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  resendApiKey: string;
  fromEmail: string;
  fromName: string;
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
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  resendApiKey: requireEnv('RESEND_API_KEY'),
  fromEmail: process.env.FROM_EMAIL || 'onboarding@resend.dev',
  fromName: process.env.FROM_NAME || 'Email API',
};

export default config;
