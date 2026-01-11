import { z } from 'zod';

const productBaseSchema = {
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot exceed 1000 characters'),
  image: z.string().trim().min(1, 'Image URL is required'),
  category: z.string().trim().min(1, 'Category is required'),
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
};

export const createProductSchema = z.object({
  body: z.object(productBaseSchema),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: productBaseSchema.name.optional(),
    price: productBaseSchema.price.optional(),
    description: productBaseSchema.description.optional(),
    image: productBaseSchema.image.optional(),
    category: productBaseSchema.category.optional(),
    stock: productBaseSchema.stock.optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
  }),
});

export const patchProductSchema = z.object({
  body: z
    .object({
      name: productBaseSchema.name.optional(),
      price: productBaseSchema.price.optional(),
      description: productBaseSchema.description.optional(),
      image: productBaseSchema.image.optional(),
      category: productBaseSchema.category.optional(),
      stock: productBaseSchema.stock.optional(),
    })
    .refine((data: Record<string, unknown>) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
  }),
});

export const getProductsQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val: string) => parseInt(val, 10))
      .pipe(z.number().int().min(1, 'Page must be a positive number')),
    limit: z
      .string()
      .optional()
      .default('10')
      .transform((val: string) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .int()
          .min(1, 'Limit must be a positive number')
          .max(100, 'Limit cannot exceed 100')
      ),
    category: z.string().trim().optional(),
    search: z.string().trim().optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type PatchProductInput = z.infer<typeof patchProductSchema>['body'];
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>['query'];
