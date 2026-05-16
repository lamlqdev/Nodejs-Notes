import { Router } from 'express';
import {
  sendEmailController,
  sendBatchEmailsController,
  getEmailController,
  cancelEmailController,
} from '../controllers/email.controller';
import { validate } from '../middlewares/validation.middleware';
import { emailLimiter } from '../middlewares/rateLimit.middleware';
import {
  sendEmailSchema,
  batchEmailSchema,
  getEmailSchema,
  cancelEmailSchema,
} from '../validations/email.validation';

const router = Router();

router.post('/send', emailLimiter, validate(sendEmailSchema), sendEmailController);
router.post('/batch', emailLimiter, validate(batchEmailSchema), sendBatchEmailsController);
router.get('/:id', validate(getEmailSchema), getEmailController);
router.delete('/:id/cancel', validate(cancelEmailSchema), cancelEmailController);

export default router;
