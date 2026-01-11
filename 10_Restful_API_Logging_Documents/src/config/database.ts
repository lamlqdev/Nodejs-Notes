import mongoose from 'mongoose';
import config from './config';

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(config.mongoUri);
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
