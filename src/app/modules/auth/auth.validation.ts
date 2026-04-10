import z from "zod";
import { Role } from "@prisma/client";

const signupZodSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Name is required" })
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name is too long"),

    email: z.email({
      error: (iss) =>
        iss.input === undefined || iss.input === "" || null
          ? "Email is required"
          : "Invalid email format",
    }),

    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password is too long")
      .regex(/[A-Z]/, "Password must contain uppercase")
      .regex(/[0-9]/, "Password must contain a number"),

    image: z.url({ error: "Invalid image URL" }).optional(),

    // z.enum now natively handles Prisma objects/enums
    role: z.enum(Role).optional().default(Role.ADMIN),
  }),
});
/**
 * Login Schema: Simpler validation for existing users
 */

const loginZodSchema = z.object({
  body: z.object({
    email: z.email({
      error: (iss) =>
        iss.input === undefined || iss.input === "" || null
          ? "Email is required"
          : "Invalid email format",
    }),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password is too long"),
  }),
});

export const AuthValidation = {
  signupZodSchema,
  loginZodSchema,
};
