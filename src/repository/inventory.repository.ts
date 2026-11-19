import { and, asc, desc, eq, ilike, isNull, lte, gt, count } from "drizzle-orm";

import { db } from "../db";
import { products, inventoryMovements } from "../db/schema";

import type {
  InventoryListQuery,
  AdjustInventoryInput,
} from "../validations/inventory.validations";

export const inventoryRepository = {
  async findAll(query: InventoryListQuery) {
    const conditions = [isNull(products.deletedAt)];

    if (query.q) {
      conditions.push(ilike(products.name, `%${query.q}%`));
    }

    if (query.stockStatus === "in_stock") {
      conditions.push(gt(products.stock, 0));
    }

    if (query.stockStatus === "low_stock") {
      conditions.push(gt(products.stock, 0));
      conditions.push(lte(products.stock, products.lowStockThreshold));
    }

    if (query.stockStatus === "out_of_stock") {
      conditions.push(eq(products.stock, 0));
    }

    const offset = (query.page - 1) * query.limit;

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(asc(products.stock), desc(products.updatedAt))
        .limit(query.limit)
        .offset(offset),

      db
        .select({ total: count() })
        .from(products)
        .where(and(...conditions)),
    ]);

    return {
      data,
      total: totalResult[0]?.total ?? 0,
    };
  },

  async findByProductId(productId: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), isNull(products.deletedAt)))
      .limit(1);

    return product ?? null;
  },

  async updateThreshold(productId: string, lowStockThreshold: number) {
    const [product] = await db
      .update(products)
      .set({
        lowStockThreshold,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, productId), isNull(products.deletedAt)))
      .returning();

    return product ?? null;
  },

  async adjustStock(productId: string, data: AdjustInventoryInput) {
    return db.transaction(async (tx) => {
      // Lock the product row to prevent concurrent stock adjustments.
      const [product] = await tx
        .select()
        .from(products)
        .where(and(eq(products.id, productId), isNull(products.deletedAt)))
        .for("update")
        .limit(1);

      if (!product) {
        return null;
      }

      const previousStock = product.stock;

      const newStock =
        data.type === "IN"
          ? previousStock + data.quantity
          : previousStock - data.quantity;

      if (newStock < 0) {
        return {
          insufficientStock: true as const,
          availableStock: previousStock,
        };
      }

      const [updatedProduct] = await tx
        .update(products)
        .set({
          stock: newStock,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      const [movement] = await tx
        .insert(inventoryMovements)
        .values({
          productId,
          type: data.type,
          reason: data.reason,
          quantity: data.quantity,
          previousStock,
          newStock,
          note: data.note ?? null,
        })
        .returning();

      return {
        insufficientStock: false as const,
        product: updatedProduct,
        movement,
      };
    });
  },

  async findMovements(productId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(inventoryMovements)
        .where(eq(inventoryMovements.productId, productId))
        .orderBy(desc(inventoryMovements.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ total: count() })
        .from(inventoryMovements)
        .where(eq(inventoryMovements.productId, productId)),
    ]);

    return {
      data,
      total: totalResult[0]?.total ?? 0,
    };
  },
};
