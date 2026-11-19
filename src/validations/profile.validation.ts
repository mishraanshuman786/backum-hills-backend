
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(255).optional(),

  phone: z.string().trim().min(7).max(20).nullable().optional(),
}).refine(
  (data) =>
    data.name !== undefined ||
    data.phone !== undefined,
  {
    message: "At least one field is required",
  },
);

export type UpdateProfileInput = z.infer<
  typeof updateProfileSchema
>;
