import { z } from 'zod';

export const listApplicationsSchema = z.object({
  query: z.object({
    jobId: z.string().optional(),
  }),
});
