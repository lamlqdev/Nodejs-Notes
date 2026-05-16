import { z } from 'zod';

const recipientField = z.union([
  z.string().email('Invalid email address'),
  z.array(z.string().email('Invalid email address')).min(1).max(50),
]);

const tagSchema = z.object({
  name: z.string().max(256),
  value: z.string().max(256),
});

const emailBaseSchema = {
  to: recipientField,
  subject: z.string().min(1, 'Subject is required').max(998),
  html: z.string().optional(),
  text: z.string().optional(),
  cc: recipientField.optional(),
  bcc: recipientField.optional(),
  replyTo: recipientField.optional(),
  scheduledAt: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  idempotencyKey: z.string().max(256).optional(),
};

export const sendEmailSchema = z.object({
  body: z
    .object(emailBaseSchema)
    .refine((data) => data.html || data.text, {
      message: 'Either html or text content is required',
      path: ['body'],
    }),
});

export const batchEmailSchema = z.object({
  body: z.object({
    emails: z
      .array(
        z
          .object(emailBaseSchema)
          .refine((data) => data.html || data.text, {
            message: 'Either html or text content is required',
          })
      )
      .min(1, 'At least one email is required')
      .max(100, 'Maximum 100 emails per batch'),
  }),
});

export const getEmailSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Email ID is required'),
  }),
});

export const cancelEmailSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Email ID is required'),
  }),
});
