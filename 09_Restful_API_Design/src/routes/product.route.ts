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
import { validate, validateObjectId } from '../middlewares/validation.middleware';
import {
  createProductSchema,
  updateProductSchema,
  patchProductSchema,
  getProductSchema,
  getProductsQuerySchema,
} from '../validations/product.validation';

const router = Router();

// Public routes - no authentication required
router.get('/', validate(getProductsQuerySchema), getProductsController); // GET /api/products - Get list of products
router.get('/:id', validate(getProductSchema), getProductController); // GET /api/products/:id - Get product details

// Protected routes - authentication required
router.post(
  '/',
  authenticate,
  validate(createProductSchema),
  createProductController
); // POST /api/products - Create new product
router.put(
  '/:id',
  authenticate,
  validate(updateProductSchema),
  updateProductController
); // PUT /api/products/:id - Update entire product
router.patch(
  '/:id',
  authenticate,
  validate(patchProductSchema),
  patchProductController
); // PATCH /api/products/:id - Partially update product
router.delete(
  '/:id',
  authenticate,
  validateObjectId(),
  deleteProductController
); // DELETE /api/products/:id - Delete product

export default router;
