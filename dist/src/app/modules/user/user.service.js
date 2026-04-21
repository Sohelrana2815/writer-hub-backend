import prisma from "../../lib/prisma.js";
import httpStatus from "http-status-codes";
import AppError from "../../errorsHelpers/AppError.js";
const getAllUsers = async () => {
    const [result, total] = await Promise.all([
        prisma.user.findMany({}),
        prisma.user.count(),
    ]);
    return {
        meta: {
            total,
        },
        data: result,
    };
};
const updateUserByAdmin = async (userId, payload) => {
    // 1. Check if the target user actually exists
    const isUserExists = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!isUserExists) {
        throw new AppError(httpStatus.StatusCodes.NOT_FOUND, "User not found!");
    }
    // 2. Perform the update
    // We only pass the specific fields allowed: name, image, role
    const result = await prisma.user.update({
        where: { id: userId },
        data: {
            name: payload.name,
            image: payload.image,
            role: payload.role,
        },
    });
    // 3. Strip password before returning
    const { password, ...userWithoutPassword } = result;
    return userWithoutPassword;
};
export const UserServices = {
    getAllUsers,
    updateUserByAdmin,
};
