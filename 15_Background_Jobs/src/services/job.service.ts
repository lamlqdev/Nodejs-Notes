import { prisma } from '../prisma/client';
import { addEmailJob } from '../queues/email.queue';
import { AppError } from '../middlewares/error.middleware';

export interface CreateJobData {
  title: string;
  company: string;
  description: string;
  expiresAt: string;
  recruiterEmail: string;
  recruiterName: string;
}

export async function createJobPosting(data: CreateJobData) {
  const job = await prisma.jobPosting.create({
    data: {
      title: data.title,
      company: data.company,
      description: data.description,
      expiresAt: new Date(data.expiresAt),
    },
  });

  await addEmailJob({
    type: 'job_posted',
    recruiterEmail: data.recruiterEmail,
    recruiterName: data.recruiterName,
    jobTitle: job.title,
    company: job.company,
    jobId: job.id,
  });

  return job;
}

export async function listActiveJobs() {
  return prisma.jobPosting.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getJobById(id: string) {
  const job = await prisma.jobPosting.findUnique({ where: { id } });
  if (!job) throw new AppError('Job posting not found', 404);
  return job;
}
