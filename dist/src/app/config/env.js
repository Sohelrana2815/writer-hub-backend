import dotenv from "dotenv";
dotenv.config();
function getEnv(key, defaultValue) {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Missing required Env variable: ${key}`);
    }
    return value;
}
export const envVars = {
    PORT: getEnv("PORT", "5001"),
    DATABASE_URL: getEnv("DATABASE_URL"),
    NODE_ENV: getEnv("NODE_ENV", "development"),
    BCRYPT_SALT_ROUND: Number(getEnv("BCRYPT_SALT_ROUND", "10")),
    //  Access Token
    JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
    JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", "1d"),
    //  Refresh Token
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
    ADMIN_EMAIL: getEnv("ADMIN_EMAIL"),
    ADMIN_PASSWORD: getEnv("ADMIN_PASSWORD"),
    // Google
    GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
    GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL"),
    // Frontend URL
    FRONTEND_URL: getEnv("FRONTEND_URL"),
    // Session
    EXPRESS_SESSION_SECRET: getEnv("EXPRESS_SESSION_SECRET"),
    // cloudinary
    CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
    // Redis
    REDIS_HOST: getEnv("REDIS_HOST"),
    REDIS_PORT: Number(getEnv("REDIS_PORT")),
    REDIS_USERNAME: getEnv("REDIS_USERNAME"),
    REDIS_PASSWORD: getEnv("REDIS_PASSWORD"),
    // Gmail SMTP
    SMTP_HOST: getEnv("SMTP_HOST"),
    SMTP_PORT: Number(getEnv("SMTP_PORT", "587")),
    SMTP_USERNAME: getEnv("SMTP_USERNAME"),
    SMTP_FROM_EMAIL: getEnv("SMTP_FROM_EMAIL"),
    SMTP_PASSWORD: getEnv("SMTP_PASSWORD"),
};
