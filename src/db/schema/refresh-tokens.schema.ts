
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema";

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // SHA-256 hash of the actual refresh token.
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),

    // Identifies all tokens belonging to one device/login.
    tokenFamilyId: uuid("token_family_id")
      .notNull()
      .defaultRandom(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("refresh_tokens_hash_unique").on(table.tokenHash),

    index("refresh_tokens_user_id_idx").on(table.userId),

    index("refresh_tokens_family_id_idx").on(table.tokenFamilyId),

    index("refresh_tokens_expires_at_idx").on(table.expiresAt),
  ],
);

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
