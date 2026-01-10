import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price cannot be negative'),
});

const orderStatusEnum = z.enum([
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
]);

const orderBaseSchema = {
  customerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid customer ID format'),
  items: z
    .array(orderItemSchema)
    .min(1, 'Order must have at least one item'),
  totalAmount: z.number().min(0, 'Total amount cannot be negative'),
  status: orderStatusEnum.optional().default('pending'),
};

export const createOrderSchema = z.object({
  body: z.object(orderBaseSchema),
});

export const updateOrderSchema = z.object({
  body: z.object({
    customerId: orderBaseSchema.customerId.optional(),
    items: orderBaseSchema.items.optional(),
    totalAmount: orderBaseSchema.totalAmount.optional(),
    status: orderStatusEnum.optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID format'),
  }),
});

export const patchOrderSchema = z.object({
  body: z
    .object({
      status: orderStatusEnum.optional(),
      // For partial update, usually only status is updated
      // Add other fields as needed
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID format'),
  }),
});

export const getOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID format'),
  }),
});

export const getOrdersQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1, 'Page must be a positive number')),
    limit: z
      .string()
      .optional()
      .default('10')
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .int()
          .min(1, 'Limit must be a positive number')
          .max(100, 'Limit cannot exceed 100')
      ),
    status: orderStatusEnum.optional(),
    customerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid customer ID format').optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>['body'];
export type PatchOrderInput = z.infer<typeof patchOrderSchema>['body'];
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>['query'];

