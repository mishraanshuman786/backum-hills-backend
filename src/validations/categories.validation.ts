import { z } from "zod";

export const categoryIdSchema = z.object({
  id: z.string().uuid("Invalid category ID"),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(255),
  slug: z.string().trim().min(2).max(255).optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isInMenu: z.boolean().optional(),
  isComingSoon: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const toggleCategoryMenuSchema = z.object({
  isInMenu: z.boolean(),
});

export type CreateCategoryInput = z.infer<
  typeof createCategorySchema
>;

export type UpdateCategoryInput = z.infer<
  typeof updateCategorySchema
>;