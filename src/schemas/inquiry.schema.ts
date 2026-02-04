import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { createPaginatedResponseSchema, PaginationQuerySchema } from "./common.schema";
import { InquiryStatus, InquiryType } from "@prisma/client";

extendZodWithOpenApi(z);

const OPEN_API_TAG = "Inquiries";

export const InquiryTypeEnum = z.enum(InquiryType);

export const InquiryStatusEnum = z.enum(InquiryStatus);

// --- Input Schemas ---

export const CreateInquirySchema = z.object({
    type: InquiryTypeEnum.openapi({ example: "RESERVATION", description: "문의 유형" }),
    title: z
        .string()
        .min(1, "제목을 입력해주세요.")
        .openapi({ example: "예약 취소 관련 문의합니다." }),
    content: z
        .string()
        .min(5, "내용을 5자 이상 입력해주세요.")
        .openapi({ example: "환불 규정이 어떻게 되나요?" }),
    images: z
        .array(z.url())
        .optional()
        .openapi({
            description: "첨부 이미지 URL 배열",
            example: ["https://example.com/img1.jpg"],
        }),
});

export const UpdateInquirySchema = z.object({
    type: InquiryTypeEnum.optional(),
    title: z.string().min(1).optional(),
    content: z.string().min(5).optional(),
    images: z.array(z.url()).optional(),
});

export const InquiryListQuerySchema = PaginationQuerySchema.extend({
    type: InquiryTypeEnum.optional().openapi({ description: "문의 유형 필터" }),
    status: InquiryStatusEnum.optional().openapi({ description: "답변 상태 필터" }),
});

// --- Output Schemas ---

const InquiryImageSchema = z.object({
    id: z.number(),
    url: z.string(),
});

export const InquiryResponseSchema = z
    .object({
        id: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
        type: InquiryTypeEnum,
        title: z.string(),
        content: z.string(),
        status: InquiryStatusEnum,
        answer: z.string().nullable().openapi({ description: "관리자 답변 (없으면 null)" }),
        answeredAt: z.date().nullable(),
        images: z.array(InquiryImageSchema),
    })
    .openapi("InquiryResponse");

export type CreateInquiryInput = z.infer<typeof CreateInquirySchema>;
export type UpdateInquiryInput = z.infer<typeof UpdateInquirySchema>;
export type InquiryListQuery = z.infer<typeof InquiryListQuerySchema>;

// --- OpenAPI Registry ---

registry.registerPath({
    method: "post",
    path: "/inquiries",
    tags: [OPEN_API_TAG],
    summary: "1:1 문의 등록",
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: CreateInquirySchema } } },
    },
    responses: {
        201: {
            description: "등록 성공",
            content: {
                "application/json": {
                    schema: z.object({ message: z.string(), data: InquiryResponseSchema }),
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/inquiries",
    tags: [OPEN_API_TAG],
    summary: "내 문의 내역 조회",
    security: [{ bearerAuth: [] }],
    request: { query: InquiryListQuerySchema },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: createPaginatedResponseSchema(InquiryResponseSchema),
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/inquiries/{id}",
    tags: [OPEN_API_TAG],
    summary: "문의 상세 조회",
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: {
            description: "조회 성공",
            content: { "application/json": { schema: z.object({ data: InquiryResponseSchema }) } },
        },
        404: { description: "문의 내역 없음" },
    },
});

registry.registerPath({
    method: "put",
    path: "/inquiries/{id}",
    tags: [OPEN_API_TAG],
    summary: "문의 수정",
    description: "답변 대기(PENDING) 상태인 경우에만 수정 가능합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ id: z.string() }),
        body: { content: { "application/json": { schema: UpdateInquirySchema } } },
    },
    responses: {
        200: { description: "수정 성공" },
        400: { description: "이미 답변이 달려 수정 불가" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/inquiries/{id}",
    tags: [OPEN_API_TAG],
    summary: "문의 삭제",
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: { description: "삭제 성공" },
    },
});
