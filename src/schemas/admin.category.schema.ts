import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";

extendZodWithOpenApi(z);

const OPEN_API_TAG = "Admin/Categories";

export const CreateCategorySchema = z.object({
    name: z.string().min(1, "카테고리 이름을 입력해주세요.").openapi({ example: "호텔" }),
    path: z.string().min(1, "URL 경로를 입력해주세요.").openapi({ example: "hotel" }),
});

export const CreateSubCategorySchema = z.object({
    categoryId: z.number().openapi({ example: 1, description: "부모 카테고리 ID" }),
    name: z.string().min(1, "2차 카테고리 이름을 입력해주세요.").openapi({ example: "디럭스 룸" }),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type CreateSubCategoryInput = z.infer<typeof CreateSubCategorySchema>;

registry.registerPath({
    method: "post",
    path: "/admin/categories",
    tags: [OPEN_API_TAG],
    summary: "1차 카테고리 생성",
    description: "이미지 파일과 함께 1차 카테고리를 생성합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: z.object({
                        name: z.string(),
                        path: z.string(),
                        // 파일 필드 정의
                        image: z.any().openapi({
                            type: "string",
                            format: "binary",
                            description: "카테고리 대표 이미지 (필수)",
                        }),
                    }),
                },
            },
        },
    },
    responses: {
        201: {
            description: "생성 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: z.any(),
                    }),
                },
            },
        },
        400: { description: "이미지가 없거나 유효성 검사 실패" },
        409: { description: "이미 존재하는 Path" },
    },
});

registry.registerPath({
    method: "post",
    path: "/admin/categories/sub",
    tags: [OPEN_API_TAG],
    summary: "2차 카테고리 생성",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: CreateSubCategorySchema },
            },
        },
    },
    responses: {
        201: { description: "생성 성공" },
        404: { description: "부모 카테고리 없음" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/admin/categories/{id}",
    tags: [OPEN_API_TAG],
    summary: "1차 카테고리 삭제",
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string() }) },
    responses: { 200: { description: "삭제 성공" } },
});

registry.registerPath({
    method: "delete",
    path: "/admin/categories/sub/{id}",
    tags: [OPEN_API_TAG],
    summary: "2차 카테고리 삭제",
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string() }) },
    responses: { 200: { description: "삭제 성공" } },
});
