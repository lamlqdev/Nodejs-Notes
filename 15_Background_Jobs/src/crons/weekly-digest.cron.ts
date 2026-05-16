import cron from 'node-cron';
import { prisma } from '../prisma/client';
import { addEmailJob, JOB_OPTIONS } from '../queues/email.queue';
import logger from '../utils/logger.util';

// Runs at 08:00 every Monday — queues a weekly_digest email job for each unique candidate
export function scheduleWeeklyDigest(): cron.ScheduledTask {
  return cron.schedule('0 8 * * 1', async () => {
    logger.info('Cron: weekly-digest starting');
    try {
      const activeJobs = await prisma.jobPosting.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, title: true, company: true },
      });

      // Collect unique candidate emails from all applications
      const candidates = await prisma.application.findMany({
        distinct: ['candidateEmail'],
        select: { candidateName: true, candidateEmail: true },
      });

      let queued = 0;
      for (const candidate of candidates) {
        await addEmailJob(
          {
            type: 'weekly_digest',
            candidateEmail: candidate.candidateEmail,
            candidateName: candidate.candidateName,
            jobCount: activeJobs.length,
            jobs: activeJobs,
          },
          JOB_OPTIONS.weekly_digest
        );
        queued++;
      }

      logger.info('Cron: weekly-digest completed', { candidatesQueued: queued });
    } catch (err) {
      logger.error('Cron: weekly-digest failed', { error: (err as Error).message });
    }
  });
}
