import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Gender, Role } from "@prisma/client";
import { registry } from "../config/openApi"; // registry 가져오기

extendZodWithOpenApi(z);

export const UserResponseSchema = z
    .object({
        id: z.number().openapi({ example: 1 }),
        username: z.string().openapi({ example: "user1234" }),
        email: z.email().openapi({ example: "user@example.com" }),
        name: z.string().openapi({ example: "홍길동" }),
        phone: z.string().openapi({ example: "010-1234-5678" }),
        birthdate: z.string().openapi({ example: "1990-01-01" }),
        gender: z.enum(Gender).openapi({ example: "MALE" }),
        role: z.enum(Role).openapi({ example: "USER" }),
        createdAt: z.iso.datetime().openapi({ example: "2024-01-01T00:00:00.000Z" }),
        updatedAt: z.iso.datetime().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    })
    .openapi("UserResponse");

export const RegisterSchema = z
    .object({
        username: z.string().min(4).openapi({ example: "user1234", description: "아이디" }),
        email: z.email().openapi({ example: "user@example.com" }),
        name: z.string().min(2).openapi({ example: "홍길동" }),
        password: z.string().min(8).openapi({ example: "password123!" }),
        password_confirm: z.string().openapi({ example: "password123!" }),
        phone: z
            .string()
            .regex(/^\d{3}-\d{3,4}-\d{4}$/)
            .openapi({ example: "010-1234-5678" }),
        birthdate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .openapi({ example: "1990-01-01" }),
        gender: z.enum(Gender).openapi({ example: "MALE" }),
    })
    .refine(data => data.password === data.password_confirm, {
        message: "비밀번호가 일치하지 않습니다.",
        path: ["password_confirm"],
    })
    .openapi("RegisterInput");

export const LoginSchema = z
    .object({
        username: z.string().openapi({ example: "user1234" }),
        password: z.string().openapi({ example: "password123!" }),
    })
    .openapi("LoginInput");

export const LoginResponseSchema = z
    .object({
        message: z.string().openapi({ example: "로그인 성공" }),
        data: z.object({
            token: z.string().openapi({ description: "JWT Access Token" }),
            user: UserResponseSchema,
        }),
    })
    .openapi("LoginResponse");

registry.registerPath({
    method: "post",
    path: "/auth/register",
    tags: ["Auth"],
    summary: "회원가입",
    description: "회원가입 폼 입력을 받아 새로운 유저를 생성합니다.",
    request: {
        body: {
            content: {
                "application/json": { schema: RegisterSchema },
            },
        },
    },
    responses: {
        201: {
            description: "회원가입 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: UserResponseSchema,
                    }),
                },
            },
        },
        400: { description: "유효성 검사 실패" },
        409: { description: "아이디 또는 이메일 중복" },
    },
});

registry.registerPath({
    method: "post",
    path: "/auth/login",
    tags: ["Auth"],
    summary: "로그인",
    description: "아이디와 비밀번호로 로그인합니다.",
    request: {
        body: {
            content: {
                "application/json": { schema: LoginSchema },
            },
        },
    },
    responses: {
        200: {
            description: "로그인 성공",
            content: {
                "application/json": { schema: LoginResponseSchema },
            },
        },
        405: { description: "아이디 또는 비밀번호 불일치" },
    },
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
