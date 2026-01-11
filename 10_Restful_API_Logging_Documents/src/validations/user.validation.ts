import { z } from 'zod';

const userRoleEnum = z.enum(['admin', 'user']);

export const signUpSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
  }),
});

export const signInSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email')
      .optional(),
  }),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: userRoleEnum,
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
  }),
});

// Export types
export type SignUpInput = z.infer<typeof signUpSchema>['body'];
export type SignInInput = z.infer<typeof signInSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>['body'];
