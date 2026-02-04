import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Gender, Role } from "@prisma/client";
import { registry } from "../config/openApi";

extendZodWithOpenApi(z);

const OPEN_API_TAG = "Admin/Users";

export const UserParamSchema = z.object({
    id: z.coerce.number().openapi({ example: 1, description: "사용자 ID" }),
});

export const PaginationQuerySchema = z.object({
    page: z.coerce.number().default(1).openapi({ example: 1, description: "페이지 번호" }),
    limit: z.coerce.number().default(10).openapi({ example: 10, description: "페이지당 항목 수" }),
});

export const UserResponseSchema = z
    .object({
        id: z.number().openapi({ example: 1 }),
        username: z.string().openapi({ example: "admin_user" }),
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

export const CreateUserInputSchema = z
    .object({
        username: z.string().min(4).openapi({ example: "new_user", description: "아이디" }),
        email: z.email().openapi({ example: "new@example.com" }),
        name: z.string().min(2).openapi({ example: "신규회원" }),
        password: z.string().min(8).openapi({ example: "password123!" }),
        phone: z.string().openapi({ example: "010-9999-8888" }),
        birthdate: z.string().openapi({ example: "2000-01-01" }),
        gender: z.enum(Gender).openapi({ example: "FEMALE" }),
        role: z.enum(Role).optional().default("USER").openapi({ example: "USER" }),
    })
    .openapi("CreateUserInput");

export const UpdateUserInputSchema = z
    .object({
        email: z.email().optional().openapi({ example: "update@example.com" }),
        password: z.string().min(8).optional(),
        name: z.string().optional(),
        phone: z.string().optional(),
        birthdate: z.string().optional(),
        gender: z.enum(Gender).optional(),
        role: z.enum(Role).optional(),
    })
    .openapi("UpdateUserInput");

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
export type PaginationQueryInput = z.infer<typeof PaginationQuerySchema>;

registry.registerPath({
    method: "get",
    path: "/admin/users",
    tags: [OPEN_API_TAG],
    summary: "전체 회원 목록 조회",
    security: [{ bearerAuth: [] }],
    request: {
        query: PaginationQuerySchema,
    },
    responses: {
        200: {
            description: "성공",
            content: {
                "application/json": {
                    schema: z.object({
                        data: z.array(UserResponseSchema),
                        pagination: z.object({
                            totalUsers: z.number(),
                            totalPages: z.number(),
                            currentPage: z.number(),
                            limit: z.number(),
                        }),
                    }),
                },
            },
        },
    },
});

// 상세 조회
registry.registerPath({
    method: "get",
    path: "/admin/users/{id}",
    tags: [OPEN_API_TAG],
    summary: "회원 상세 조회",
    security: [{ bearerAuth: [] }],
    request: {
        params: UserParamSchema,
    },
    responses: {
        200: {
            description: "성공",
            content: { "application/json": { schema: z.object({ data: UserResponseSchema }) } },
        },
        404: { description: "회원 없음" },
    },
});

registry.registerPath({
    method: "post",
    path: "/admin/users",
    tags: [OPEN_API_TAG],
    summary: "회원 생성 (관리자)",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: { "application/json": { schema: CreateUserInputSchema } },
        },
    },
    responses: {
        201: { description: "생성 성공" },
        409: { description: "중복된 ID" },
    },
});

registry.registerPath({
    method: "put",
    path: "/admin/users/{id}",
    tags: [OPEN_API_TAG],
    summary: "회원 정보 수정 (관리자)",
    security: [{ bearerAuth: [] }],
    request: {
        params: UserParamSchema,
        body: {
            content: { "application/json": { schema: UpdateUserInputSchema } },
        },
    },
    responses: {
        200: { description: "수정 성공" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/admin/users/{id}",
    tags: [OPEN_API_TAG],
    summary: "회원 삭제 (관리자)",
    security: [{ bearerAuth: [] }],
    request: {
        params: UserParamSchema,
    },
    responses: {
        200: { description: "삭제 성공" },
    },
});
