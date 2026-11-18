
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { productStatusEnum } from "./enums";
import { categories } from "./catgories.schema";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),

    slug: varchar("slug", { length: 255 }).notNull(),

    sku: varchar("sku", { length: 100 }),

    description: text("description"),

    categoryId: uuid("category_id").references(
      () => categories.id,
      { onDelete: "set null" }
    ),

    pricePaise: integer("price_paise").notNull(),

    compareAtPricePaise: integer("compare_at_price_paise"),

    stock: integer("stock").notNull().default(0),

    lowStockThreshold: integer("low_stock_threshold")
      .notNull()
      .default(10),

    status: productStatusEnum("status")
      .notNull()
      .default("draft"),

    colorName: varchar("color_name", { length: 100 }),

    colorHex: varchar("color_hex", { length: 20 }),

    groupKey: varchar("group_key", { length: 255 }),

    sizes: text("sizes").array().notNull().default(sql`'{}'::text[]`),

    badgeText: varchar("badge_text", { length: 100 }),

    ratingAvg: numeric("rating_avg", {
      precision: 3,
      scale: 2,
    }).notNull().default("0"),

    ratingCount: integer("rating_count").notNull().default(0),

    soldCount: integer("sold_count").notNull().default(0),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),

    uniqueIndex("products_sku_unique")
      .on(table.sku)
      .where(sql`${table.sku} IS NOT NULL`),

    index("products_category_id_idx").on(table.categoryId),

    index("products_status_idx").on(table.status),

    index("products_group_key_idx").on(table.groupKey),

    check("products_price_check", sql`${table.pricePaise} > 0`),

    check(
      "products_compare_price_check",
      sql`${table.compareAtPricePaise} IS NULL OR ${table.compareAtPricePaise} >= ${table.pricePaise}`
    ),

    check("products_stock_check", sql`${table.stock} >= 0`),

    check(
      "products_low_stock_threshold_check",
      sql`${table.lowStockThreshold} >= 0`
    ),

    check(
      "products_rating_count_check",
      sql`${table.ratingCount} >= 0`
    ),

    check(
      "products_sold_count_check",
      sql`${table.soldCount} >= 0`
    ),
  ]
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
