import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { ProductResponseSchema } from "./product.schema";

extendZodWithOpenApi(z);

const SubCategorySimpleSchema = z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: "디럭스 룸" }),
    categoryId: z.number().openapi({ example: 10 }),
});

export const CategoryResponseSchema = z
    .object({
        id: z.number().openapi({ example: 10 }),
        name: z.string().openapi({ example: "호텔" }),
        path: z.string().openapi({ example: "hotel" }),
        image: z.string().openapi({ example: "https://storage.googleapis.com/.../hotel.jpg" }),
        subCategories: z.array(SubCategorySimpleSchema),
    })
    .openapi("CategoryResponse");

export const SubCategoryDetailSchema = z
    .object({
        id: z.number().openapi({ example: 1 }),
        name: z.string().openapi({ example: "디럭스 룸" }),
        categoryId: z.number().openapi({ example: 10 }),
        category: z.object({
            id: z.number(),
            name: z.string().openapi({ example: "호텔" }),
            path: z.string().openapi({ example: "hotel" }),
        }),
        products: z
            .array(ProductResponseSchema)
            .openapi({ description: "해당 카테고리의 상품 목록" }),
    })
    .openapi("SubCategoryDetailResponse");

registry.registerPath({
    method: "get",
    path: "/categories",
    tags: ["Categories"],
    summary: "카테고리 메뉴 조회",
    description: "1차 카테고리 목록과 하위 2차 카테고리 구조를 조회합니다.",
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: z.array(CategoryResponseSchema),
                    }),
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/categories/{path}/{subId}",
    tags: ["Categories"],
    summary: "2차 카테고리 상세 조회 (상품 포함)",
    description:
        "1차 카테고리의 path(예: hotel)와 2차 카테고리의 id를 이용해 상품 목록을 조회합니다.",
    request: {
        params: z.object({
            path: z.string().openapi({ example: "hotel", description: "1차 카테고리 Path" }),
            subId: z.string().openapi({ example: "1", description: "2차 카테고리 ID" }),
        }),
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: SubCategoryDetailSchema,
                    }),
                },
            },
        },
        404: { description: "경로가 잘못되었거나 카테고리가 없음" },
    },
});
