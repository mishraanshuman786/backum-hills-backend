
import {
  and,
  eq,
  gt,
  isNull,
} from "drizzle-orm";

import { db } from "../db";
import { refreshTokens } from "../db/schema";

export const refreshTokenRepository = {
  async create(data: {
    userId: string;
    tokenHash: string;
    tokenFamilyId: string;
    expiresAt: Date;
  }) {
    const [token] = await db
      .insert(refreshTokens)
      .values(data)
      .returning();

    return token;
  },

  async findActiveByHash(tokenHash: string) {
    const [token] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return token ?? null;
  },

  async findByHash(tokenHash: string) {
    const [token] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    return token ?? null;
  },

  async revokeById(id: string) {
    const [token] = await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.id, id),
          isNull(refreshTokens.revokedAt),
        ),
      )
      .returning();

    return token ?? null;
  },

  async revokeFamily(tokenFamilyId: string) {
    return db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.tokenFamilyId, tokenFamilyId),
          isNull(refreshTokens.revokedAt),
        ),
      );
  },

  async revokeAllByUser(userId: string) {
    return db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt),
        ),
      );
  },

  async rotate(
    oldTokenId: string,
    newToken: {
      userId: string;
      tokenHash: string;
      tokenFamilyId: string;
      expiresAt: Date;
    },
  ) {
    return db.transaction(async (tx) => {
      const [oldToken] = await tx
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.id, oldTokenId))
        .for("update")
        .limit(1);

      if (
        !oldToken ||
        oldToken.revokedAt ||
        oldToken.expiresAt <= new Date()
      ) {
        return null;
      }

      const [revoked] = await tx
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokens.id, oldTokenId),
            isNull(refreshTokens.revokedAt),
          ),
        )
        .returning();

      if (!revoked) {
        return null;
      }

      const [created] = await tx
        .insert(refreshTokens)
        .values(newToken)
        .returning();

      return {
        oldToken: revoked,
        newToken: created,
      };
    });
  },
};
