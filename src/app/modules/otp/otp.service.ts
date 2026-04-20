import crypto from "crypto";
import { redisClient } from "../../config/redis.config.js";
import { sendEmail } from "../../utils/sendEmail.js";
const OTP_EXPIRATION = 2 * 60; // 2 minutes

const generateOtp = (length = 6) => {
  // 6 digit random number
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  return otp;
};
const sendOtp = async (email: string, name: string) => {
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

const verifyOtp = async () => {
  return {};
};

export const OtpServices = {
  sendOtp,
  verifyOtp,
};
