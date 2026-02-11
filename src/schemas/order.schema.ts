import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { createPaginatedResponseSchema } from "./common.schema";

extendZodWithOpenApi(z);

const OPEN_API_TAG = "Orders"; // [요청 반영] 태그 상수화

// --- Input Schemas ---

const OrderItemInputSchema = z.object({
    roomTypeId: z.number().openapi({ example: 1, description: "객실 타입 ID" }),
    quantity: z.number().min(1).openapi({ example: 1, description: "객실 수량" }),
});

export const CreateOrderSchema = z.object({
    recipientName: z.string().min(1).openapi({ example: "홍길동" }),
    recipientPhone: z.string().min(1).openapi({ example: "010-1234-5678" }),
    adultNum: z.number().min(1).openapi({ example: 2 }),
    childrenNum: z.number().min(0).openapi({ example: 0 }),
    checkInDate: z.coerce.date().openapi({ example: "2024-05-01" }),
    checkOutDate: z.coerce.date().openapi({ example: "2024-05-03" }),
    items: z.array(OrderItemInputSchema).min(1, "최소 1개의 객실을 선택해야 합니다."),
});

export const ConfirmPaymentSchema = z.object({
    paymentKey: z.string().openapi({ example: "tgen_...", description: "토스 결제 키" }),
    orderId: z.string().openapi({ example: "10", description: "주문 ID (String)" }),
    amount: z.number().openapi({ example: 300000, description: "결제 금액" }),
});

export const CancelOrderSchema = z.object({
    cancelReason: z.string().min(1, "취소 사유를 입력해주세요.").openapi({ example: "단순 변심" }),
});

const OrderItemResponseSchema = z.object({
    id: z.number(),
    roomType: z
        .object({
            id: z.number(),
            name: z.string(),
            image: z.string(),
            product: z.object({
                name: z.string().openapi({ example: "신라호텔" }),
            }),
        })
        .nullable(),
    quantity: z.number(),
    price: z.number(),
});

export const OrderDetailSchema = z.object({
    id: z.number(),
    createdAt: z.date(),
    totalPrice: z.number(),
    status: z.enum(["PENDING", "PAID", "CANCELED"]),
    recipientName: z.string(),
    checkInDate: z.date(),
    checkOutDate: z.date(),
    items: z.array(OrderItemResponseSchema),
}).openapi("OrderResponse");

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type ConfirmPaymentInput = z.infer<typeof ConfirmPaymentSchema>;
export type CancelOrderInput = z.infer<typeof CancelOrderSchema>;

// --- OpenAPI Registry ---

registry.registerPath({
    method: "post",
    path: "/orders",
    tags: [OPEN_API_TAG], // 상수 사용
    summary: "주문 생성 (결제 전)",
    description: "주문을 생성하고 'PENDING' 상태로 저장합니다. 반환된 orderId로 프론트엔드에서 토스 결제창을 띄우세요.",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: { "application/json": { schema: CreateOrderSchema } },
        },
    },
    responses: {
        201: {
            description: "주문 생성 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: z.object({
                            orderId: z.number(),
                            totalPrice: z.number(),
                            orderName: z.string(),
                            customerEmail: z.string(),
                            customerName: z.string(),
                        }),
                    }),
                },
            },
        },
    },
});

registry.registerPath({
    method: "post",
    path: "/orders/confirm",
    tags: [OPEN_API_TAG], // 상수 사용
    summary: "결제 승인 (토스페이먼츠)",
    description:
        "프론트엔드에서 결제 성공 후 받은 paymentKey 등을 이용해 서버에서 최종 승인 처리를 합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: { "application/json": { schema: ConfirmPaymentSchema } },
        },
    },
    responses: {
        200: {
            description: "결제 및 주문 완료",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: z.object({
                            payment: z.object({}).openapi({ description: "토스 결제 객체 (Any)" }),
                            order: OrderDetailSchema,
                        }),
                    }),
                },
            },
        },
        400: { description: "결제 금액 불일치 또는 승인 실패" },
    },
});

registry.registerPath({
    method: "get",
    path: "/orders",
    tags: [OPEN_API_TAG],
    summary: "내 주문 목록 조회",
    security: [{ bearerAuth: [] }],
    request: {
        query: z.object({
            page: z.coerce.number().optional(),
            limit: z.coerce.number().optional(),
        }),
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": { schema: createPaginatedResponseSchema(OrderDetailSchema) },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/orders/{id}",
    tags: [OPEN_API_TAG],
    summary: "주문 상세 조회",
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: { description: "조회 성공" },
    },
});

registry.registerPath({
    method: "post",
    path: "/orders/{id}/cancel",
    tags: [OPEN_API_TAG],
    summary: "주문 취소 (환불 포함)",
    description:
        "결제 완료된 주문은 토스페이먼츠 환불 API를 호출하고, 대기 중인 주문은 즉시 취소 처리합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ id: z.string() }),
        body: { content: { "application/json": { schema: CancelOrderSchema } } },
    },
    responses: {
        200: { description: "취소 성공" },
        400: { description: "이미 취소되었거나 취소할 수 없는 상태" },
        403: { description: "권한 없음" },
    },
});