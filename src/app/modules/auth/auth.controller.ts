/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import AppError from "../../errorsHelpers/AppError.js";
import passport from "passport";
import { User } from "@prisma/client";

const signup = catchAsync(async (req: Request, res: Response) => {
  // console.log("from auth controller", req.body);
  console.log("From signup controller: ", {
    file: req.file,
    body: req.body,
  });
  const payload: User = {
    ...req.body,
    image: req.file?.path,
  };

  const result = await AuthServices.signup(payload);
  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.CREATED,
    success: true,
    message: "User Created Successfully",
    // data: user,
    data: result,
  });
});

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body);
    // const result = await AuthServices.login(req.body);
    passport.authenticate(
      "local",
      { session: false },
      async (err: any, user: any, info: any) => {
        if (err) {
          // ❌❌❌❌❌
          // throw new AppError(401, "Some error")
          // next(err)
          // return new AppError(401, err)
          // return next(err);
          return next(new AppError(401, err));
        }

        if (!user) {
          console.log("from !user");
          return next(new AppError(401, info.message));
        }

        const { accessToken, refreshToken } =
          await AuthServices.createAuthTokens(user);
        const { password: _, ...userWithoutPassword } = user;

        // // Set Access Token in HTTP-Only Cookie

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000, // 15 minutes
        });

        // Set Refresh Token in HTTP-Only Cookie

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        sendResponse(res, {
          statusCode: httpStatus.StatusCodes.OK,
          success: true,
          message: "User Logged In Successfully",
          data: {
            accessToken,
            refreshToken,
            userWithoutPassword,
          },
        });
      },
    )(req, res, next);

    // const { accessToken, refreshToken, user } = result;
  },
);

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.cookies; // Read from cookie sent by Server Action
  if (!token) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "Refresh token not found",
    );
  }
  const result = await AuthServices.refreshToken(token);
  sendResponse(res, {
    statusCode: httpStatus.StatusCodes.OK,
    success: true,
    message: "Access token refreshed",
    data: result,
  });
});
// googleCallBack controller

const googleCallback = catchAsync(async (req: Request, res: Response) => {
  let redirectTo = req.query.state ? (req.query.state as string) : "";
  if (redirectTo.startsWith("/")) {
    redirectTo = redirectTo.slice(1);
  }
  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }

  const result = await AuthServices.googleLogin(req.user); //
  const { accessToken, refreshToken, user } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // ৩০ দিন [cite: 50]
  });

  res.redirect(`${process.env.FRONTEND_URL}/${redirectTo}`);
});

export const AuthControllers = {
  signup,
  credentialsLogin,
  refreshToken,
  googleCallback,
};
