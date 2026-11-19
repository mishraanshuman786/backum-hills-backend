
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(255),

  email: z.string().trim().email().transform((value) =>
    value.toLowerCase()
  ),

  phone: z.string().trim().min(7).max(20).optional(),

  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email().transform((value) =>
    value.toLowerCase()
  ),

  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),

  newPassword: z.string().min(8).max(72),
}).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: "New password must be different from current password",
    path: ["newPassword"],
  },
);

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
