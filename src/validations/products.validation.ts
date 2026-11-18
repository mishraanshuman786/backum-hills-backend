import { z } from "zod";



const productStatus = z.enum([
  "active",
  "draft",
  "archived",
]);

const productObjectSchema = z.object({
  name: z.string().trim().min(2).max(255),
  slug: z.string().trim().min(2).max(255).optional(),
  sku: z.string().trim().max(100).nullable().optional(),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),

  pricePaise: z.number().int().positive(),
  compareAtPricePaise: z.number().int().positive().nullable().optional(),

  stock: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),

  status: productStatus.optional(),

  colorName: z.string().max(100).nullable().optional(),
  colorHex: z.string().max(20).nullable().optional(),
  groupKey: z.string().max(255).nullable().optional(),

  sizes: z.array(z.string()).optional(),
  badgeText: z.string().max(100).nullable().optional(),
});

export const productIdSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
});

export const productSlugSchema = z.object({
  slug: z.string().min(1),
});

export const productListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  inStock: z.enum(["true", "false"]).optional(),
  sort: z.enum([
    "featured",
    "price_asc",
    "price_desc",
    "newest",
    "best_selling",
  ]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminProductListQuerySchema = z.object({
  q: z.string().optional(),
  status: productStatus.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createProductSchema = productObjectSchema.refine(
  (data) =>
    data.compareAtPricePaise == null ||
    data.compareAtPricePaise >= data.pricePaise,
  {
    message: "Compare-at price must be greater than or equal to price",
    path: ["compareAtPricePaise"],
  },
);

export const updateProductSchema = productObjectSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })
  .refine(
    (data) =>
      data.pricePaise === undefined ||
      data.compareAtPricePaise == null ||
      data.compareAtPricePaise >= data.pricePaise,
    {
      message: "Compare-at price must be greater than or equal to price",
      path: ["compareAtPricePaise"],
    },
  );

export type CreateProductInput = z.infer<
  typeof createProductSchema
>;

export type UpdateProductInput = z.infer<
  typeof updateProductSchema
>;

export type ProductListQuery = z.infer<
  typeof productListQuerySchema
>;