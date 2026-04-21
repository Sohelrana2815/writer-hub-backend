import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status-codes";
import { OtpServices } from "./otp.service.js";

const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  await OtpServices.sendOtp(email, name);
  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "OTP sent successfully",
    data: null,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  await OtpServices.verifyOtp(email, otp);

  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "OTP verified successfully",
    data: null,
  });
});

export const OtpControllers = {
  sendOtp,
  verifyOtp,
};
