import crypto from "crypto";
import { redisClient } from "../../config/redis.config.js";
import { sendEmail } from "../../utils/sendEmail.js";
import AppError from "../../errorsHelpers/AppError.js";
import prisma from "../../lib/prisma.js";
const OTP_EXPIRATION = 2 * 60; // 2 minutes
const generateOtp = (length = 6) => {
    // 6 digit random number
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
    return otp;
};
const sendOtp = async (email, name) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
    if (!user) {
        throw new AppError(404, "User not found");
    }
    if (user.isVerified) {
        throw new AppError(400, "You are verified");
    }
    const otp = generateOtp();
    const redisKey = `otp:${email}`;
    await redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION,
        },
    });
    await sendEmail({
        to: email,
        subject: "Your OTP Code",
        templateName: "otp",
        templateData: {
            name: name,
            otp: otp,
        },
    });
};
const verifyOtp = async (email, otp) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
            isVerified: false,
        },
    });
    if (!user) {
        throw new AppError(404, "User not found");
    }
    if (user.isVerified) {
        throw new AppError(400, "Your are already verified");
    }
    const redisKey = `otp:${email}`;
    const savedOtp = await redisClient.get(redisKey);
    if (!savedOtp) {
        throw new AppError(401, "Invalid OTP");
    }
    if (savedOtp !== otp) {
        throw new AppError(401, "Invalid OTP");
    }
    Promise.all([
        prisma.user.update({
            where: { email: email },
            data: { isVerified: true },
        }),
        redisClient.del([redisKey]),
    ]);
};
export const OtpServices = {
    sendOtp,
    verifyOtp,
};
