import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { createPaginatedResponseSchema, PaginationQuerySchema } from "./common.schema";

extendZodWithOpenApi(z);

const OPEN_API_TAG = "Reviews";

// --- Input Schemas ---

export const CreateReviewSchema = z.object({
    roomTypeId: z.number().int().openapi({ example: 10, description: "리뷰할 객실 타입 ID" }),
    content: z
        .string()
        .min(10, "리뷰 내용은 최소 10자 이상이어야 합니다.")
        .openapi({ example: "방이 너무 깨끗하고 좋았습니다!" }),
    rating: z.number().int().min(1).max(5).openapi({ example: 5, description: "평점 (1~5)" }),
    images: z
        .array(z.url())
        .optional()
        .openapi({
            example: ["https://img.com/review1.jpg"],
            description: "이미지 URL 배열",
        }),
});

export const UpdateReviewSchema = z.object({
    content: z.string().min(10).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    images: z
        .array(z.url())
        .optional()
        .openapi({
            description: "기존 이미지를 모두 지우고 새로 덮어씁니다.",
            example: ["https://new-image.com/1.jpg"],
        }),
});

export const ReviewListQuerySchema = PaginationQuerySchema.extend({
    productId: z.coerce
        .number()
        .optional()
        .openapi({ description: "특정 상품(숙소)의 리뷰만 조회 시" }),
    roomTypeId: z.coerce
        .number()
        .optional()
        .openapi({ description: "특정 객실 타입의 리뷰만 조회 시" }),
    sort: z
        .enum(["latest", "rating_desc", "rating_asc"])
        .default("latest")
        .openapi({ description: "정렬 순서" }),
});

export const CheckReviewQuerySchema = z.object({
    roomTypeId: z.coerce
        .number()
        .min(1)
        .openapi({ example: 10, description: "확인할 객실 타입 ID" }),
});

// --- Output Schemas ---

const ReviewImageSchema = z.object({
    id: z.number(),
    url: z.string(),
});

const ReviewUserSchema = z.object({
    name: z.string().openapi({ example: "김철수" }),
});

export const ReviewResponseSchema = z
    .object({
        id: z.number(),
        createdAt: z.date(),
        content: z.string(),
        rating: z.number(),
        user: ReviewUserSchema,
        product: z
            .object({
                id: z.number(),
                name: z.string().openapi({ example: "신라호텔" }),
            })
            .nullable(),
        roomType: z.object({
            id: z.number(),
            name: z.string().openapi({ example: "디럭스 룸" }),
        }),
        images: z.array(ReviewImageSchema),
    })
    .openapi("ReviewResponse");

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;
export type ReviewListQuery = z.infer<typeof ReviewListQuerySchema>;
export type CheckReviewQuery = z.infer<typeof CheckReviewQuerySchema>;

// --- OpenAPI Registry ---

registry.registerPath({
    method: "post",
    path: "/reviews",
    tags: [OPEN_API_TAG],
    summary: "리뷰 작성",
    description: "로그인한 사용자가 특정 객실에 대한 리뷰를 작성합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: CreateReviewSchema } } },
    },
    responses: {
        201: {
            description: "작성 성공",
            content: { "application/json": { schema: ReviewResponseSchema } },
        },
        400: { description: "입력값 오류" },
        404: { description: "객실 타입 없음" },
    },
});

registry.registerPath({
    method: "get",
    path: "/reviews",
    tags: [OPEN_API_TAG],
    summary: "리뷰 목록 조회 (공개)",
    description: "상품별, 객실별 리뷰를 조회합니다.",
    request: { query: ReviewListQuerySchema },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": { schema: createPaginatedResponseSchema(ReviewResponseSchema) },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/reviews/me",
    tags: [OPEN_API_TAG],
    summary: "내가 쓴 리뷰 조회",
    security: [{ bearerAuth: [] }],
    request: { query: PaginationQuerySchema },
    responses: {
        200: { description: "조회 성공" },
    },
});

registry.registerPath({
    method: "get",
    path: "/reviews/check", // ID 파라미터 라우트보다 위에 정의해야 함
    tags: [OPEN_API_TAG],
    summary: "리뷰 작성 여부 확인",
    description: "로그인한 사용자가 특정 객실 타입에 대해 이미 리뷰를 작성했는지 확인합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        query: CheckReviewQuerySchema,
    },
    responses: {
        200: {
            description: "확인 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        hasReview: z.boolean().openapi({ description: "리뷰 작성 여부" }),
                        reviewId: z
                            .number()
                            .nullable()
                            .openapi({ description: "작성한 리뷰 ID (없으면 null)" }),
                    }),
                },
            },
        },
    },
});

registry.registerPath({
    method: "put",
    path: "/reviews/{id}",
    tags: [OPEN_API_TAG],
    summary: "리뷰 수정",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ id: z.string() }),
        body: { content: { "application/json": { schema: UpdateReviewSchema } } },
    },
    responses: {
        200: { description: "수정 성공" },
        403: { description: "본인의 리뷰만 수정 가능" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/reviews/{id}",
    tags: [OPEN_API_TAG],
    summary: "리뷰 삭제",
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: { description: "삭제 성공" },
        403: { description: "본인의 리뷰만 삭제 가능" },
    },
});
