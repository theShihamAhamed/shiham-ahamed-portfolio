import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("A valid admin email is required"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenBodySchema = z
  .object({
    refreshToken: z.string().trim().min(1).optional(),
  })
  .default({});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RefreshTokenBodySchema = z.infer<typeof refreshTokenBodySchema>;
