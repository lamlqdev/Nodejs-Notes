import type { Request, Response } from 'express';
import {
  sendEmail,
  sendBatchEmails,
  getEmailById,
  cancelScheduledEmail,
} from '../services/email.service';
import { AppError } from '../middlewares/error.middleware';
import type { SendEmailPayload, BatchEmailPayload } from '../types/email.types';

export async function sendEmailController(req: Request, res: Response) {
  const payload = req.body as SendEmailPayload;

  const data = await sendEmail(payload);

  res.status(200).json({
    success: true,
    message: 'Email sent successfully',
    data,
  });
}

export async function sendBatchEmailsController(req: Request, res: Response) {
  const payload = req.body as BatchEmailPayload;

  const data = await sendBatchEmails(payload);

  res.status(200).json({
    success: true,
    message: 'Batch emails sent successfully',
    data,
  });
}

export async function getEmailController(req: Request, res: Response) {
  const id = req.params.id as string;

  const data = await getEmailById(id);

  if (!data) {
    throw new AppError('Email not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Email retrieved successfully',
    data,
  });
}

export async function cancelEmailController(req: Request, res: Response) {
  const id = req.params.id as string;

  const data = await cancelScheduledEmail(id);

  res.status(200).json({
    success: true,
    message: 'Scheduled email cancelled successfully',
    data,
  });
}
