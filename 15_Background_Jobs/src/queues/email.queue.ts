import { Queue, type JobsOptions } from 'bullmq';
import { redisConnection } from './redis.connection';
import type { EmailJobPayload } from '../types/index';
import logger from '../utils/logger.util';

export const emailQueue = new Queue<EmailJobPayload>('email-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100, // keep last 100 completed jobs for inspection
    removeOnFail: 50,
  },
});

// --- DRY job options per job type ---

export const JOB_OPTIONS = {
  application_received: {
    priority: 2,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  } satisfies JobsOptions,

  job_posted: {
    priority: 2,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  } satisfies JobsOptions,

  follow_up_reminder: {
    priority: 5,
    delay: 259_200_000, // 3 days in ms
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  } satisfies JobsOptions,

  weekly_digest: {
    priority: 10,
    attempts: 2,
    backoff: { type: 'fixed', delay: 10000 },
  } satisfies JobsOptions,
} as const;

// --- Queue helpers ---

export async function addEmailJob(
  payload: EmailJobPayload,
  options?: JobsOptions
): Promise<void> {
  const jobOptions = options ?? JOB_OPTIONS[payload.type];
  const job = await emailQueue.add(payload.type, payload, jobOptions);
  logger.info('Email job enqueued', { jobId: job.id, type: payload.type });
}

emailQueue.on('error', (err) => {
  logger.error('Email queue error', { error: err.message });
});
