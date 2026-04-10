/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.service.js";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers();

    sendResponse(res, {
      statusCode: httpStatus.StatusCodes.OK,
      success: true,
      message: "All Users Retrieved Successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

export const UserControllers = {
  getAllUsers,
};
