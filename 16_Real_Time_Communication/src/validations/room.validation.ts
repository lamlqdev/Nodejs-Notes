import { z } from 'zod';

export const createRoomSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Room name must be at least 2 characters')
      .max(50, 'Room name cannot exceed 50 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Room name can only contain letters, numbers, hyphens, and underscores'),
  }),
});

export const roomParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Room ID is required'),
  }),
});

export const sseParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Room ID is required'),
  }),
});
