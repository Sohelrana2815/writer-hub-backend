import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import httpStatus from "http-status-codes";
import { CategoryServices } from "./category.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.createCategory(req.body);
  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.CREATED,
    success: true,
    message: "Category Created Successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.getAllCategories();
  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "All Categories Fetched Successfully",
    meta: result.meta,
    data: result.data,
  });
});


export const CategoryControllers = {
  createCategory,
  getAllCategories,
};
