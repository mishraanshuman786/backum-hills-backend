
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { userRoleEnum } from "./enums";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),

    email: varchar("email", { length: 255 }).notNull(),

    phone: varchar("phone", { length: 20 }),

    passwordHash: varchar("password_hash", { length: 255 }).notNull(),

    role: userRoleEnum("role").notNull().default("customer"),

    isActive: boolean("is_active").notNull().default(true),

    // Reserved for future Resend email verification.
    emailVerifiedAt: timestamp("email_verified_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(
      sql`lower(${table.email})`,
    ),

    index("users_role_idx").on(table.role),
    index("users_is_active_idx").on(table.isActive),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
