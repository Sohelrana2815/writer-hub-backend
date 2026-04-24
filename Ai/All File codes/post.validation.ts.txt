import { z } from "zod";
import { PostStatus } from "@prisma/client";

const postBodySchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title is too long"),
  slug: z
    .string({ error: "Slug is required" })
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphenated"),
  excerpt: z
    .string({ error: "Excerpt is required" })
    .min(10, "Excerpt is too short")
    .max(300, "Excerpt cannot exceed 300 characters"),

  content: z
    .string({ error: "Content is required" })
    .min(20, "Content is too short to be a post"),

  featuredImage: z.string().url("Invalid image URL").optional(),

  status: z
    .enum(Object.values(PostStatus) as [string, ...string[]])
    .default(PostStatus.DRAFT),

  categoryId: z.string({
    error: "Please select a category",
  }),

  readingTime: z
    .number({ error: "Reading time must be a number" })
    .int()
    .positive()
    .default(5),

  difficulty: z.string().default("Intermediate"),

  keywords: z
    .array(z.string().trim())
    .min(1, "At least one keyword is required for SEO")
    .default([]),
});

const createPostZodSchema = z.object({
  body: postBodySchema,
});

/**
 * Robust Update: We make the INSIDE of the body partial,
 * so you can update just the title, or just the status.
 */
const updatePostZodSchema = z.object({
  body: postBodySchema.partial(),
});

export const PostValidation = {
  createPostZodSchema,
  updatePostZodSchema,
};
