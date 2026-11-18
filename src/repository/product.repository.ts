import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  lte,
  gt,
  count,
} from "drizzle-orm";

import { db } from "../db";
import { products, categories } from "../db/schema";


import type { CreateProductInput, UpdateProductInput, ProductListQuery } from "../validations/products.validation";

export const productsRepository = {
  // Public product listing
  async findPublicProducts(
    filters: ProductListQuery,
    categoryId?: string,
  ) {
    const conditions = [
      eq(products.status, "active"),
      isNull(products.deletedAt),
    ];

    if (filters.q) {
      conditions.push(ilike(products.name, `%${filters.q}%`));
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (filters.minPrice !== undefined) {
      conditions.push(gte(products.pricePaise, filters.minPrice));
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(lte(products.pricePaise, filters.maxPrice));
    }

    if (filters.inStock === "true") {
      conditions.push(gt(products.stock, 0));
    }

    if (filters.inStock === "false") {
      conditions.push(eq(products.stock, 0));
    }

    let orderBy;

    switch (filters.sort) {
      case "price_asc":
        orderBy = asc(products.pricePaise);
        break;

      case "price_desc":
        orderBy = desc(products.pricePaise);
        break;

      case "best_selling":
        orderBy = desc(products.soldCount);
        break;

      case "featured":
        // Temporary fallback until a featured field is added.
        orderBy = desc(products.soldCount);
        break;

      default:
        orderBy = desc(products.createdAt);
    }

    const offset = (filters.page - 1) * filters.limit;

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(filters.limit)
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

  async findPublicBySlug(slug: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.slug, slug),
          eq(products.status, "active"),
          isNull(products.deletedAt),
        ),
      )
      .limit(1);

    return product ?? null;
  },

  async findSiblings(groupKey: string, currentId: string) {
    return db
      .select()
      .from(products)
      .where(
        and(
          eq(products.groupKey, groupKey),
          eq(products.status, "active"),
          isNull(products.deletedAt),
        ),
      )
      .orderBy(asc(products.colorName));
  },

  // Admin listing
  async findAdminProducts(
    q: string | undefined,
    status: "active" | "draft" | "archived" | undefined,
    page: number,
    limit: number,
  ) {
    const conditions = [isNull(products.deletedAt)];

    if (q) {
      conditions.push(ilike(products.name, `%${q}%`));
    }

    if (status) {
      conditions.push(eq(products.status, status));
    }

    const offset = (page - 1) * limit;

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(desc(products.createdAt))
        .limit(limit)
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

  async findById(id: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, id),
          isNull(products.deletedAt),
        ),
      )
      .limit(1);

    return product ?? null;
  },

  async findByCategorySlug(slug: string) {
    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    return category ?? null;
  },

  async create(data: CreateProductInput & { slug: string }) {
    const [product] = await db
      .insert(products)
      .values(data)
      .returning();

    return product;
  },

  async update(id: string, data: UpdateProductInput) {
    const [product] = await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.id, id),
          isNull(products.deletedAt),
        ),
      )
      .returning();

    return product ?? null;
  },

  async softDelete(id: string) {
    const [product] = await db
      .update(products)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.id, id),
          isNull(products.deletedAt),
        ),
      )
      .returning();

    return product ?? null;
  },
};