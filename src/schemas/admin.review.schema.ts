import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { createPaginatedResponseSchema, PaginationQuerySchema } from "./common.schema";
import { ReviewResponseSchema } from "./review.schema"; // 사용자용 스키마 재사용

extendZodWithOpenApi(z);

const OPEN_API_TAG = "Admin/Reviews";

// --- Input Schemas ---

export const AdminReviewListQuerySchema = PaginationQuerySchema.extend({
    search: z.string().optional().openapi({ description: "리뷰 내용 또는 작성자 이름 검색" }),
    productId: z.coerce.number().optional().openapi({ description: "특정 상품(숙소) ID 필터" }),
    roomTypeId: z.coerce.number().optional().openapi({ description: "특정 객실 타입 ID 필터" }),
    rating: z.coerce.number().int().min(1).max(5).optional().openapi({ description: "평점 필터" }),
});

export type AdminReviewListQuery = z.infer<typeof AdminReviewListQuerySchema>;

// --- OpenAPI Registry ---

registry.registerPath({
    method: "get",
    path: "/admin/reviews",
    tags: [OPEN_API_TAG],
    summary: "전체 리뷰 목록 조회 (관리자용)",
    description: "모든 사용자의 리뷰를 조회합니다. 검색 및 필터링이 가능합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        query: AdminReviewListQuerySchema,
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: createPaginatedResponseSchema(ReviewResponseSchema),
                },
            },
        },
    },
});

registry.registerPath({
    method: "delete",
    path: "/admin/reviews/{id}",
    tags: [OPEN_API_TAG],
    summary: "리뷰 강제 삭제",
    description: "부적절한 리뷰를 관리자가 삭제합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        200: { description: "삭제 성공" },
        404: { description: "리뷰를 찾을 수 없음" },
    },
});