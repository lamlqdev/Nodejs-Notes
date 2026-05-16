import { prisma } from '../prisma/client';
import { addEmailJob, JOB_OPTIONS } from '../queues/email.queue';
import { AppError } from '../middlewares/error.middleware';

export interface ApplyToJobData {
  jobId: string;
  candidateName: string;
  candidateEmail: string;
}

export async function applyToJob(data: ApplyToJobData) {
  const job = await prisma.jobPosting.findUnique({ where: { id: data.jobId } });
  if (!job) throw new AppError('Job posting not found', 404);
  if (job.status === 'EXPIRED') throw new AppError('This job posting has expired', 400);

  const application = await prisma.application.create({
    data: {
      jobPostingId: data.jobId,
      candidateName: data.candidateName,
      candidateEmail: data.candidateEmail,
    },
  });

  // Immediate confirmation email — priority 2, attempts 3
  await addEmailJob({
    type: 'application_received',
    candidateName: data.candidateName,
    candidateEmail: data.candidateEmail,
    jobTitle: job.title,
    company: job.company,
    applicationId: application.id,
  });

  // Follow-up reminder after 3 days — delayed job
  await addEmailJob(
    {
      type: 'follow_up_reminder',
      candidateName: data.candidateName,
      candidateEmail: data.candidateEmail,
      jobTitle: job.title,
      company: job.company,
      applicationId: application.id,
    },
    JOB_OPTIONS.follow_up_reminder
  );

  return application;
}

export async function listApplications(jobId?: string) {
  return prisma.application.findMany({
    where: jobId ? { jobPostingId: jobId } : undefined,
    include: { jobPosting: { select: { title: true, company: true } } },
    orderBy: { appliedAt: 'desc' },
  });
}
