import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const signup = catchAsync(async (req: Request, res: Response) => {
  // console.log("from auth controller", req.body);
  const user = await AuthServices.signup(req.body);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.CREATED,
    success: true,
    message: "User Created Successfully",
    data: user,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.body);
  const result = await AuthServices.login(req.body);

  const { accessToken, refreshToken, user } = result;

  // Set Refresh Token in HTTP-Only Cookie

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // // Set Access Token in HTTP-Only Cookie

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "User Logged In Successfully",
    data: {
      accessToken,
      refreshToken,
      user,
    },
  });
});
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies; // Read from cookie sent by Server Action
  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Access token refreshed",
    data: result,
  });
});
export const AuthControllers = {
  signup,
  login,
  refreshToken,
};
