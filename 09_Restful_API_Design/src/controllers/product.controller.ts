import type { Request, Response } from 'express';
import {
  findProducts,
  findProductById,
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
} from '../services/product.service';

/**
 * GET /api/products - Get list of all products with pagination and filtering
 * Note: Input validation is handled by validateProductQuery middleware
 */
export async function getProductsController(req: Request, res: Response) {
  const { page = '1', limit = '10', category, search } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // Build filter
  const filter = {
    ...(category && { category: category as string }),
    ...(search && { search: search as string }),
  };

  // Get products from service layer
  const result = await findProducts(filter, {
    page: pageNum,
    limit: limitNum,
  });

  res.json({
    message: 'Products retrieved successfully',
    data: {
      products: result.data,
      pagination: result.pagination,
    },
  });
}

/**
 * GET /api/products/:id - Get a single product by ID
 * Note: ID format validation is handled by validateObjectId middleware
 * Business logic (check existence) is handled by service layer
 */
export async function getProductController(req: Request, res: Response) {
  const { id } = req.params;

  const product = await findProductById(id);

  if (!product) {
    // Note: This could also throw AppError from service layer
    return res.status(404).json({
      message: 'Product not found',
    });
  }

  res.json({
    message: 'Product retrieved successfully',
    data: product,
  });
}

/**
 * POST /api/products - Create a new product (requires authentication)
 * Note: Input validation is handled by validateCreateProduct middleware
 * Business logic (uniqueness check) is handled by service layer
 */
export async function createProductController(req: Request, res: Response) {
  const { name, price, description, image, category, stock } = req.body;

  // Create new product through service layer
  // Service layer handles business logic validation (e.g., name uniqueness)
  const product = await createProductService({
    name,
    price,
    description,
    image,
    category,
    stock,
  });

  res.status(201).json({
    message: 'Product created successfully',
    data: product,
  });
}

/**
 * PUT /api/products/:id - Update entire product (requires authentication)
 * Note: Input validation is handled by validateUpdateProduct and validateObjectId middlewares
 * Business logic (existence check, uniqueness) is handled by service layer
 */
export async function updateProductController(req: Request, res: Response) {
  const { id } = req.params;
  const { name, price, description, image, category, stock } = req.body;

  // Get current product name for uniqueness check
  const currentProduct = await findProductById(id);
  const currentProductName = currentProduct?.name;

  // Update product through service layer
  // Service layer handles business logic validation (existence, uniqueness)
  const product = await updateProductService(
    id,
    {
      name,
      price,
      description,
      image,
      category,
      stock,
    },
    currentProductName
  );

  res.json({
    message: 'Product updated successfully',
    data: product,
  });
}

/**
 * PATCH /api/products/:id - Partially update product (requires authentication)
 * Note: Input validation is handled by validatePatchProduct and validateObjectId middlewares
 * Business logic (existence check, uniqueness) is handled by service layer
 */
export async function patchProductController(req: Request, res: Response) {
  const { id } = req.params;
  const updates = req.body;

  // Get current product name for uniqueness check
  const currentProduct = await findProductById(id);
  const currentProductName = currentProduct?.name;

  // Update product through service layer
  // Service layer handles business logic validation (existence, uniqueness)
  const product = await updateProductService(id, updates, currentProductName);

  res.json({
    message: 'Product updated successfully',
    data: product,
  });
}

/**
 * DELETE /api/products/:id - Delete a product (requires authentication)
 * Note: ID format validation is handled by validateObjectId middleware
 * Business logic (existence check) is handled by service layer
 */
export async function deleteProductController(req: Request, res: Response) {
  const { id } = req.params;

  // Delete product through service layer
  // Service layer handles business logic validation (existence check)
  const product = await deleteProductService(id);

  res.json({
    message: 'Product deleted successfully',
    data: product,
  });
}
