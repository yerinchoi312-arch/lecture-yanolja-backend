import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { UserResponseSchema } from "./auth.schema";

extendZodWithOpenApi(z);

export const UpdateProfileSchema = z
    .object({
        name: z.string().min(2).optional().openapi({ example: "홍길동" }),
        phone: z
            .string()
            .regex(/^\d{3}-\d{3,4}-\d{4}$/, "전화번호 형식이 올바르지 않습니다.")
            .optional()
            .openapi({ example: "010-9876-5432" }),
        birthdate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다.")
            .optional()
            .openapi({ example: "1995-05-05" }),
    })
    .openapi("UpdateProfileInput");

export const ChangePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, "현재 비밀번호를 입력해주세요.")
            .openapi({ example: "password123!" }),
        newPassword: z
            .string()
            .min(8, "새 비밀번호는 8자 이상이어야 합니다.")
            .openapi({ example: "newpassword123!" }),
        newPasswordConfirm: z.string().openapi({ example: "newpassword123!" }),
    })
    .refine(data => data.newPassword === data.newPasswordConfirm, {
        message: "새 비밀번호가 일치하지 않습니다.",
        path: ["newPasswordConfirm"],
    })
    .openapi("ChangePasswordInput");

// --- OpenAPI Registry 등록 ---

registry.registerPath({
    method: "put",
    path: "/users/me",
    tags: ["Users"],
    summary: "내 정보 수정",
    description: "로그인한 사용자의 프로필 정보를 수정합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: UpdateProfileSchema },
            },
        },
    },
    responses: {
        200: {
            description: "정보 수정 성공",
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
    },
});

registry.registerPath({
    method: "patch",
    path: "/users/me/password",
    tags: ["Users"],
    summary: "비밀번호 변경",
    description: "현재 비밀번호 확인 후 새 비밀번호로 변경합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: ChangePasswordSchema },
            },
        },
    },
    responses: {
        200: {
            description: "비밀번호 변경 성공",
            content: {
                "application/json": { schema: z.object({ message: z.string() }) },
            },
        },
        400: { description: "유효성 검사 실패" },
        405: { description: "현재 비밀번호 불일치" },
    },
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
