import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { products } from "./products.schema";

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),

    type: varchar("type", { length: 10 }).notNull(),

    reason: varchar("reason", { length: 50 }).notNull(),

    quantity: integer("quantity").notNull(),

    previousStock: integer("previous_stock").notNull(),

    newStock: integer("new_stock").notNull(),

    note: text("note"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("inventory_movements_product_id_idx").on(table.productId),
    index("inventory_movements_created_at_idx").on(table.createdAt),

    check(
      "inventory_movements_type_check",
      sql`${table.type} IN ('IN', 'OUT')`,
    ),

    check(
      "inventory_movements_quantity_check",
      sql`${table.quantity} > 0`,
    ),

    check(
      "inventory_movements_stock_check",
      sql`${table.previousStock} >= 0 AND ${table.newStock} >= 0`,
    ),
  ],
);

export type InventoryMovement =
  typeof inventoryMovements.$inferSelect;

export type NewInventoryMovement =
  typeof inventoryMovements.$inferInsert;