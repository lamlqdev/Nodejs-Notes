export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
  scheduledAt?: string;
  tags?: Array<{ name: string; value: string }>;
  idempotencyKey?: string;
}

export interface BatchEmailPayload {
  emails: SendEmailPayload[];
}
