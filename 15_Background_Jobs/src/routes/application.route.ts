import { Router } from 'express';
import { listApplicationsController } from '../controllers/application.controller';
import { validate } from '../middlewares/validation.middleware';
import { listApplicationsSchema } from '../validations/application.validation';

const router = Router();

router.get('/', validate(listApplicationsSchema), listApplicationsController);

export default router;
