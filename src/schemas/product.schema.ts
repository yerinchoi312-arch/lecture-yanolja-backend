import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { createPaginatedResponseSchema, PaginationQuerySchema } from "./common.schema";

extendZodWithOpenApi(z);

export const ProductQuerySchema = PaginationQuerySchema.extend({
    categoryId: z.coerce.number().optional().openapi({ example: 1, description: "1차 카테고리 ID" }),
    subCategoryId: z.coerce.number().optional().openapi({ example: 10, description: "2차 카테고리 ID" }),
    keyword: z.string().optional().openapi({ example: "강남", description: "검색어 (이름/주소)" }),
});

export const ProductParamsSchema = z.object({
    id: z.coerce.number().min(1, "상품 ID는 1 이상의 숫자여야 합니다.").openapi({ example: 1, description: "상품 ID" }),
});

export const ProductListItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    address: z.string(),
    thumbnail: z.string().openapi({ description: "대표 이미지 1장" }),
    minPrice: z.number().openapi({ description: "객실 중 최저가" }),
    ratingAvg: z.number().openapi({ description: "리뷰 평점 평균 (없으면 0)" }),
    reviewCount: z.number(),
});

export const ProductDetailSchema = z.object({
    id: z.number(),
    categoryId: z.number(),
    subCategoryId: z.number(),
    name: z.string(),
    address: z.string(),
    description: z.string(),
    notice: z.string(),

    images: z.array(z.string()),

    roomTypes: z.array(z.object({
        id: z.number(),
        name: z.string(),
        description: z.string(),
        image: z.string(),
        originPrice: z.number(),
        price: z.number(),
    })),

    ratingAvg: z.number(),
    reviewCount: z.number(),
});

registry.registerPath({
    method: "get",
    path: "/products",
    tags: ["Products"],
    summary: "상품 목록 조회 (사용자)",
    description: "카테고리별 필터링 및 검색이 가능한 상품 목록을 조회합니다.",
    request: {
        query: ProductQuerySchema,
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: createPaginatedResponseSchema(ProductListItemSchema),
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/products/{id}",
    tags: ["Products"],
    summary: "상품 상세 조회 (사용자)",
    request: {
        params: ProductParamsSchema,
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: z.object({ data: ProductDetailSchema }),
                },
            },
        },
        404: { description: "상품을 찾을 수 없음" },
    },
});

export type ProductQuery = z.infer<typeof ProductQuerySchema>;
export type ProductParams = z.infer<typeof ProductParamsSchema>;