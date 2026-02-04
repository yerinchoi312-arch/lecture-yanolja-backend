import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { createPaginatedResponseSchema, PaginationQuerySchema } from "./common.schema";
import { OrderDetailSchema } from "./order.schema"; // 기존 사용자용 스키마 재사용 (필요시 확장)

extendZodWithOpenApi(z);

const OPEN_API_TAG = "Admin/Orders";

export const AdminOrderListQuerySchema = PaginationQuerySchema.extend({
    search: z.string().optional().openapi({ description: "주문자 이름 또는 이메일 검색" }),
    status: z.enum(["PENDING", "PAID", "CANCELED"]).optional().openapi({ description: "주문 상태 필터" }),
    startDate: z.coerce.date().optional().openapi({ description: "조회 시작일 (YYYY-MM-DD)" }),
    endDate: z.coerce.date().optional().openapi({ description: "조회 종료일 (YYYY-MM-DD)" }),
});

// 주문 상태 강제 변경 (예: 관리자가 입금 확인 후 수동으로 PAID 처리하거나 취소 처리)
export const UpdateOrderStatusSchema = z.object({
    status: z.enum([
        "PENDING",
        "PAID",
        "CANCELED",
        // 필요하다면 "REFUND_REQUESTED", "REFUND_COMPLETED" 등 추가
    ]).openapi({ example: "PAID", description: "변경할 주문 상태" }),
});

export type AdminOrderListQuery = z.infer<typeof AdminOrderListQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

// --- OpenAPI Registry ---

registry.registerPath({
    method: "get",
    path: "/admin/orders",
    tags: [OPEN_API_TAG],
    summary: "전체 주문 목록 조회 (검색/필터)",
    description: "다양한 조건(검색어, 날짜, 상태)으로 주문 목록을 조회합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        query: AdminOrderListQuerySchema,
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: createPaginatedResponseSchema(OrderDetailSchema),
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/admin/orders/{id}",
    tags: [OPEN_API_TAG],
    summary: "주문 상세 조회",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": { schema: z.object({ message: z.string(), data: OrderDetailSchema }) },
            },
        },
    },
});

registry.registerPath({
    method: "patch",
    path: "/admin/orders/{id}/status",
    tags: [OPEN_API_TAG],
    summary: "주문 상태 변경",
    description: "주문의 상태를 강제로 변경합니다. (주의: 실제 PG 취소 연동은 포함되지 않음)",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ id: z.string() }),
        body: {
            content: { "application/json": { schema: UpdateOrderStatusSchema } },
        },
    },
    responses: {
        200: { description: "상태 변경 성공" },
        404: { description: "주문 없음" },
    },
});