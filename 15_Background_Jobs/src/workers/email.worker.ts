import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../queues/redis.connection';
import { sendEmailForJob } from '../services/email.service';
import type { EmailJobPayload } from '../types/index';
import logger from '../utils/logger.util';

let emailWorker: Worker<EmailJobPayload> | null = null;

async function processEmailJob(job: Job<EmailJobPayload>): Promise<void> {
  logger.info('Processing email job', { jobId: job.id, type: job.data.type });
  await sendEmailForJob(job.data);
  logger.info('Email job completed', { jobId: job.id, type: job.data.type });
}

export function startWorkers(): void {
  emailWorker = new Worker<EmailJobPayload>('email-queue', processEmailJob, {
    connection: redisConnection,
    concurrency: 5,
  });

  emailWorker.on('completed', (job) => {
    logger.info('Worker: job completed', { jobId: job.id, type: job.data.type });
  });

  emailWorker.on('failed', (job, err) => {
    logger.error('Worker: job failed', {
      jobId: job?.id,
      type: job?.data?.type,
      attempt: job?.attemptsMade,
      error: err.message,
    });
  });

  emailWorker.on('error', (err) => {
    logger.error('Worker error', { error: err.message });
  });

  logger.info('Email worker started');
}

export async function stopWorkers(): Promise<void> {
  if (emailWorker) {
    await emailWorker.close();
    logger.info('Email worker stopped');
  }
}
