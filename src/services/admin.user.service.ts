import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { CreateUserInput, UpdateUserInput } from "../schemas/admin.user.schema";

export class AdminUserService {
    async getAllUsers(page: number = 1, limit: number = 10, searchTerm?: string) {
        const skip = (page - 1) * limit;

        const whereClause = searchTerm
            ? {
                OR: [
                    { username: { contains: searchTerm } },
                    { name: { contains: searchTerm } },
                    { email: { contains: searchTerm } },
                ],
            }
            : {};

        const [total, users] = await prisma.$transaction([
            prisma.user.count({
                where: whereClause,
            }),
            prisma.user.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    phone: true,
                    birthdate: true,
                    gender: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
        ]);

        return { total, users };
    }

    async getUserById(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new HttpException(404, "해당 회원을 찾을 수 없습니다.");
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async createUser(data: CreateUserInput) {
        // CreateUserInput 타입 사용
        const existingUser = await prisma.user.findUnique({
            where: { username: data.username },
        });

        if (existingUser) {
            throw new HttpException(409, "이미 존재하는 사용자ID 입니다.");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                birthdate: data.birthdate,
                gender: data.gender,
                role: data.role || Role.USER,
            },
        });

        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    async updateUser(userId: number, data: UpdateUserInput) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new HttpException(404, "해당 회원을 찾을 수 없습니다.");

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { ...data },
        });

        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    async deleteUser(userId: number) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new HttpException(404, "해당 회원을 찾을 수 없습니다.");

        await prisma.user.delete({
            where: { id: userId },
        });

        return { message: "회원이 삭제되었습니다.", deletedId: userId };
    }
}