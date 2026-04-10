/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import AppError from "../../errorsHelpers/AppError.js";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import { envVars } from "../../config/env.js";
import { generateToken, verifyToken } from "../../utils/jwt.js";
import { JwtPayload } from "jsonwebtoken";

type LoginPayload = Pick<Prisma.UserCreateInput, "email" | "password">;

const signup = async (payload: Prisma.UserCreateInput) => {
  const duplicateEmail = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (duplicateEmail) {
    throw new AppError(
      httpStatus.StatusCodes.CONFLICT,
      "User with this email already exists",
    );
  }
  // Ensure password exists before hashing
  if (!payload.password) {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      "Password is required",
    );
  }

  // 1. Hash password - Using await correctly
  const saltRounds = Number(envVars.BCRYPT_SALT_ROUND) || 10;
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

  // 2. Create the user object with the correct type
  // We explicitly define the data to satisfy Prisma's strict type checking

  const result = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });
  // 3. Remove password from the returned object for security

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const login = async (payload: LoginPayload) => {
  const { email, password } = payload;

  // 1. Input Validation
  // Use findUnique for efficient lookup
  if (!email || !password) {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      "Email and password are required",
    );
  }
  // 2. Find the User by Email
  const user = await prisma.user.findUnique({
    where: { email },
  });
  // 3. Handle Non-Existent User

  if (!user || !user.password) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "Invalid credentials",
    );
  }

  // 4. Verify the Password

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  // 5. Handle Incorrect Password
  if (!isPasswordMatch) {
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "Email or password is incorrect",
    );
  }

  // 6. Check User Status (Optional but Recommended)
  // For example, is the account active, verified, or banned?
  // if (user.sta !== "ACTIVE") {
  //   throw new AppError(
  //     httpStatus.FORBIDDEN,
  //     "Your account is inactive",
  //   );
  // }

  // 7. Generate JWT Tokens

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  // Generate Access Token (Short-lived)

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES_IN || "15m",
  );

  // Generate Refresh Token (Long-lived)

  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES_IN || "30d",
  );

  const { password: _, ...userWithoutPassword } = user;

  return {
    accessToken,
    refreshToken,
    user: userWithoutPassword,
  };
};

export const refreshToken = async (token: string) => {
  const decoded = verifyToken<JwtPayload>(token, envVars.JWT_REFRESH_SECRET);
  if (!decoded)
    throw new AppError(
      httpStatus.StatusCodes.UNAUTHORIZED,
      "Invalid Refresh Token",
    );

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user)
    throw new AppError(httpStatus.StatusCodes.NOT_FOUND, "User not found");

  const accessToken = generateToken(
    { userId: user.id, email: user.email, role: user.role },
    envVars.JWT_ACCESS_SECRET,
    "15m",
  );
  return { accessToken };
};

export const AuthServices = {
  signup,
  login,
  refreshToken,
};
