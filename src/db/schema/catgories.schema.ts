import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),

    slug: varchar("slug", { length: 255 }).notNull(),

    description: text("description"),

    imageUrl: text("image_url"),

    isInMenu: boolean("is_in_menu").default(false).notNull(),

    isComingSoon: boolean("is_coming_soon").default(false).notNull(),

    sortOrder: integer("sort_order").default(0).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("categories_slug_unique").on(table.slug),

    index("categories_sort_order_idx").on(table.sortOrder),

    index("categories_is_in_menu_idx").on(table.isInMenu),

    check(
      "categories_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;