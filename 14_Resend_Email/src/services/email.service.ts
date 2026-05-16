import { Resend, type CreateEmailOptions } from 'resend';
import config from '../config/config';
import type { SendEmailPayload, BatchEmailPayload } from '../types/email.types';
import logger from '../utils/logger.util';

const resend = new Resend(config.resendApiKey);

const from = `${config.fromName} <${config.fromEmail}>`;

function buildEmailOptions(payload: SendEmailPayload): CreateEmailOptions {
  return {
    from,
    to: payload.to,
    subject: payload.subject,
    ...(payload.html !== undefined && { html: payload.html }),
    ...(payload.text !== undefined && { text: payload.text }),
    ...(payload.cc !== undefined && { cc: payload.cc }),
    ...(payload.bcc !== undefined && { bcc: payload.bcc }),
    ...(payload.replyTo !== undefined && { replyTo: payload.replyTo }),
    ...(payload.scheduledAt !== undefined && { scheduledAt: payload.scheduledAt }),
    ...(payload.tags !== undefined && { tags: payload.tags }),
  } as CreateEmailOptions;
}

export async function sendEmail(payload: SendEmailPayload) {
  const { data, error } = await resend.emails.send(buildEmailOptions(payload));

  if (error) {
    logger.error('Resend send error', { error });
    throw error;
  }

  logger.info('Email sent', { id: data?.id, to: payload.to });
  return data;
}

export async function sendBatchEmails(payload: BatchEmailPayload) {
  const messages = payload.emails.map((email) => buildEmailOptions(email));

  const { data, error } = await resend.batch.send(messages);

  if (error) {
    logger.error('Resend batch send error', { error });
    throw error;
  }

  logger.info('Batch emails sent', { count: messages.length });
  return data;
}

export async function getEmailById(id: string) {
  const { data, error } = await resend.emails.get(id);

  if (error) {
    logger.error('Resend get email error', { error, id });
    throw error;
  }

  return data;
}

export async function cancelScheduledEmail(id: string) {
  const { data, error } = await resend.emails.cancel(id);

  if (error) {
    logger.error('Resend cancel email error', { error, id });
    throw error;
  }

  logger.info('Scheduled email cancelled', { id });
  return data;
}
