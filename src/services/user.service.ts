import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { ChangePasswordInput, UpdateProfileInput } from "../schemas/user.schema";

export class UserService {
    async updateProfile(userId: number, data: UpdateProfileInput) {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
            },
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    async changePassword(userId: number, data: ChangePasswordInput) {
        const { currentPassword, newPassword } = data;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new HttpException(404, "사용자를 찾을 수 없습니다.");
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new HttpException(405, "현재 비밀번호가 일치하지 않습니다.");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });

        return true;
    }
}