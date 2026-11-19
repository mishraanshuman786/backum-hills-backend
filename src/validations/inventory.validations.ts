import { z } from "zod";

export const inventoryProductIdSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
});

export const inventoryListQuerySchema = z.object({
  q: z.string().optional(),

  stockStatus: z.enum([
    "all",
    "in_stock",
    "low_stock",
    "out_of_stock",
  ]).default("all"),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateInventoryThresholdSchema = z.object({
  lowStockThreshold: z.number().int().min(0),
});

export const adjustInventorySchema = z.object({
  type: z.enum(["IN", "OUT"]),

  quantity: z.number().int().positive(),

  reason: z.enum([
    "PURCHASE",
    "DAMAGED",
    "RETURNED",
    "MANUAL_ADJUSTMENT",
    "CORRECTION",
  ]),

  note: z.string().trim().max(500).nullable().optional(),
});

export const inventoryMovementQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type InventoryListQuery = z.infer<
  typeof inventoryListQuerySchema
>;

export type UpdateInventoryThresholdInput = z.infer<
  typeof updateInventoryThresholdSchema
>;

export type AdjustInventoryInput = z.infer<
  typeof adjustInventorySchema
>;

export type InventoryMovementQuery = z.infer<
  typeof inventoryMovementQuerySchema
>;