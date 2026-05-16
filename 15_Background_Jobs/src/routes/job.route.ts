import { Router } from 'express';
import {
  createJobController,
  listJobsController,
  applyToJobController,
} from '../controllers/job.controller';
import { validate } from '../middlewares/validation.middleware';
import { createJobSchema, applyToJobSchema } from '../validations/job.validation';

const router = Router();

router.get('/', listJobsController);
router.post('/', validate(createJobSchema), createJobController);
router.post('/:id/apply', validate(applyToJobSchema), applyToJobController);

export default router;
