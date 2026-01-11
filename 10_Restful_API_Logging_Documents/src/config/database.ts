import mongoose from 'mongoose';
import config from './config';
import logger from '../utils/logger.util';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB successfully');
  } catch (error) {
    logger.error('Error connecting to MongoDB', { error });
    process.exit(1);
  }
};
