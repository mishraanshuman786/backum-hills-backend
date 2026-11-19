
import { eq, sql } from "drizzle-orm";

import { db, pool } from "./index";
import { users } from "./schema";
import { env } from "../config/env";
import { hashPassword } from "../utils/password";

async function seed() {
  console.log("Starting database seed...");

  const email = env.ADMIN_EMAIL.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD;

  // bcrypt supports a maximum of 72 bytes.
  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("ADMIN_PASSWORD must not exceed 72 bytes.");
  }

  // Check whether the admin account already exists.
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .limit(1);

  if (existingAdmin) {
    // Ensure the configured account has admin privileges.
    await db
      .update(users)
      .set({
        role: "admin",
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingAdmin.id));

    console.log("Admin account already exists.");
    console.log("Admin privileges verified successfully.");

    return;
  }

  // Hash the password before storing it.
  const passwordHash = await hashPassword(password);

  // Create the initial admin account.
  const [admin] = await db
    .insert(users)
    .values({
      name: "Store Admin",
      email,
      passwordHash,
      role: "admin",
      isActive: true,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

  console.log("Admin account created successfully.");
  console.log({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });
}

seed()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
