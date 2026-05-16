import { z } from 'zod';

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters').max(150),
    company: z.string().trim().min(2, 'Company must be at least 2 characters').max(100),
    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
    expiresAt: z
      .string()
      .datetime({ message: 'expiresAt must be an ISO 8601 datetime string' })
      .refine((d) => new Date(d) > new Date(), { message: 'expiresAt must be in the future' }),
    recruiterEmail: z.string().email('Invalid recruiter email'),
    recruiterName: z.string().trim().min(1, 'Recruiter name is required'),
  }),
});

export const applyToJobSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Job ID is required'),
  }),
  body: z.object({
    candidateName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    candidateEmail: z.string().email('Invalid candidate email'),
  }),
});
