import { Router } from 'express';
import {
  getProductsController,
  getProductController,
  createProductController,
  updateProductController,
  patchProductController,
  deleteProductController,
} from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdmin } from '../middlewares/authorize.middleware';
import {
  validate,
  validateObjectId,
} from '../middlewares/validation.middleware';
import {
  createProductSchema,
  updateProductSchema,
  patchProductSchema,
  getProductSchema,
  getProductsQuerySchema,
} from '../validations/product.validation';

const router = Router();

// Public routes - no authentication required
router.get('/', validate(getProductsQuerySchema), getProductsController);
router.get('/:id', validate(getProductSchema), getProductController);

// Protected routes - admin only
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  validate(createProductSchema),
  createProductController
);
router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  validate(updateProductSchema),
  updateProductController
);
router.patch(
  '/:id',
  authenticate,
  authorizeAdmin,
  validate(patchProductSchema),
  patchProductController
);
router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  validateObjectId(),
  deleteProductController
);

export default router;
