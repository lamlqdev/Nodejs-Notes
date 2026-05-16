import type { ScheduledTask } from 'node-cron';
import { scheduleMidnightExpiry } from './midnight-expiry.cron';
import { scheduleWeeklyDigest } from './weekly-digest.cron';
import logger from '../utils/logger.util';

const tasks: ScheduledTask[] = [];

export function startCronJobs(): void {
  tasks.push(scheduleMidnightExpiry());
  tasks.push(scheduleWeeklyDigest());
  logger.info('Cron jobs started', { count: tasks.length });
}

export function stopCronJobs(): void {
  tasks.forEach((task) => task.stop());
  logger.info('Cron jobs stopped');
}
