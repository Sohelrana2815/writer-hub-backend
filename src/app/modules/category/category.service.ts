import { Category } from "@prisma/client";
import prisma from "../../lib/prisma.js";

const createCategory = async (payload: Category) => {
  return await prisma.category.create({
    data: payload,
  });
};

const getAllCategories = async () => {
  const [result, total] = await Promise.all([
    prisma.category.findMany({}),
    prisma.category.count(),
  ]);
  return {
    meta: {
      total,
    },
    data: result,
  };
};


export const CategoryServices = {
  createCategory,
  getAllCategories,
  
};
