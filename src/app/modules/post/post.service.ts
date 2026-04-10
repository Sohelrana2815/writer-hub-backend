/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "../../lib/prisma.js";

const createPost = async (authorId: string, payload: any) => {
  const { categoryId, ...postData } = payload;

  return await prisma.post.create({
    data: {
      ...postData,
      // Link the Author (extracted from JWT)
      author: {
        connect: { id: authorId },
      },
      // Link the Category (selected by Admin in the request)
      category: {
        connect: { id: categoryId },
      },
    },
  });
};

const getAllPosts = async () => {
  const [result, total] = await Promise.all([
    prisma.post.findMany({
      include: {
        category: { select: { name: true, slug: true } },
        author: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.count(),
  ]);

  return {
    meta: {
      total,
    },
    data: result,
  };
};

const getPostBySlug = async (slug: string) => {
  return await prisma.post.findUnique({
    where: { slug },

    include: {
      category: true, // Include category for better SEO context [cite: 6]
      author: {
        select: { name: true, image: true }, // Only get necessary author info [cite: 2]
      },
    },
  });
};

const getPostsByCategorySlug = async (slug: string) => {
  return await prisma.post.findMany({
    where: {
      category: {
        slug: slug, // Filtering through the relation
      },
    },
    include: {
      category: true,
      author: { select: { name: true, image: true } },
    },
  });
};

export const PostServices = {
  createPost,
  getAllPosts,
  getPostBySlug,
  getPostsByCategorySlug,
};
