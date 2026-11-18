import { eq, asc, count } from "drizzle-orm";

import { db } from "../db";
import { categories, products } from "../db/schema";

export const categoriesRepository = {
  async findAll() {
    return db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder));
  },

  async findMenuCategories() {
    return db
      .select()
      .from(categories)
      .where(eq(categories.isInMenu, true))
      .orderBy(asc(categories.sortOrder));
  },

  async findById(id: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return category ?? null;
  },

  async findBySlug(slug: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    return category ?? null;
  },

  async create(data: typeof categories.$inferInsert) {
    const [category] = await db
      .insert(categories)
      .values(data)
      .returning();

    return category;
  },

  async update(
    id: string,
    data: Partial<typeof categories.$inferInsert>,
  ) {
    const [category] = await db
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return category ?? null;
  },

  async delete(id: string) {
    const [category] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    return category ?? null;
  },

  async countProducts(id: string) {
    const [result] = await db
      .select({ total: count() })
      .from(products)
      .where(eq(products.categoryId, id));

    return result?.total ?? 0;
  },
};