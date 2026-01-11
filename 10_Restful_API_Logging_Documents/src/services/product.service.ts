import { Product } from '../models/product.model';
import type { Types } from 'mongoose';
import { AppError } from '../middlewares/error.middleware';

export interface ProductFilter {
  category?: string;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: Record<string, 1 | -1>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateProductData {
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  description?: string;
  image?: string;
  category?: string;
  stock?: number;
}

export async function findProducts(
  filter: ProductFilter,
  options: PaginationOptions
): Promise<PaginatedResult<any>> {
  const { page, limit, sort = { createdAt: -1 } } = options;

  // Build MongoDB filter query
  const query: Record<string, any> = {};
  if (filter.category) {
    query.category = filter.category;
  }
  if (filter.search) {
    query.$or = [
      { name: { $regex: filter.search, $options: 'i' } },
      { description: { $regex: filter.search, $options: 'i' } },
    ];
  }

  // Calculate skip
  const skip = (page - 1) * limit;

  // Execute queries in parallel
  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: products,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function findProductById(id: string | Types.ObjectId) {
  const product = await Product.findById(id);
  return product;
}

export async function findProductByName(name: string) {
  const product = await Product.findOne({ name: name.trim() });
  return product;
}

export async function createProduct(data: CreateProductData) {
  // Business logic validation: Check uniqueness
  const existingProduct = await findProductByName(data.name);
  if (existingProduct) {
    throw new AppError('Product with this name already exists', 409);
  }

  const product = await Product.create({
    name: data.name.trim(),
    price: data.price,
    description: data.description.trim(),
    image: data.image.trim(),
    category: data.category.trim(),
    stock: data.stock,
  });
  return product;
}

export async function updateProduct(
  id: string | Types.ObjectId,
  data: UpdateProductData,
  currentProductName?: string
) {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Business logic validation: Check name uniqueness if name is being changed
  if (data.name && data.name.trim() !== currentProductName) {
    const existingProduct = await findProductByName(data.name);
    if (existingProduct) {
      throw new AppError('Product with this name already exists', 409);
    }
  }

  // Update fields
  if (data.name !== undefined) product.name = data.name.trim();
  if (data.price !== undefined) product.price = data.price;
  if (data.description !== undefined)
    product.description = data.description.trim();
  if (data.image !== undefined) product.image = data.image.trim();
  if (data.category !== undefined) product.category = data.category.trim();
  if (data.stock !== undefined) product.stock = data.stock;

  await product.save();
  return product;
}

export async function deleteProduct(id: string | Types.ObjectId) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
}

export async function countProducts(filter: ProductFilter): Promise<number> {
  const query: Record<string, any> = {};
  if (filter.category) {
    query.category = filter.category;
  }
  if (filter.search) {
    query.$or = [
      { name: { $regex: filter.search, $options: 'i' } },
      { description: { $regex: filter.search, $options: 'i' } },
    ];
  }
  return Product.countDocuments(query);
}
