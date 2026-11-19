
import { eq, sql } from "drizzle-orm";

import { db } from "../db";
import { users } from "../db/schema";

export const userRepository = {
  async findById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  },

  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = lower(${email})`)
      .limit(1);

    return user ?? null;
  },

  async create(data: {
    name: string;
    email: string;
    phone?: string | null;
    passwordHash: string;
    role?: "admin" | "customer";
  }) {
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        role: data.role ?? "customer",
      })
      .returning();

    return user;
  },

  async updateProfile(
    id: string,
    data: {
      name?: string;
      phone?: string | null;
    },
  ) {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
  },

  async updatePassword(id: string, passwordHash: string) {
    const [user] = await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
  },
};
