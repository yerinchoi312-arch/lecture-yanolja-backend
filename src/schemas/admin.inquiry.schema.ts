import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { createPaginatedResponseSchema, PaginationQuerySchema } from "./common.schema";
import { InquiryResponseSchema, InquiryStatusEnum, InquiryTypeEnum } from "./inquiry.schema";

extendZodWithOpenApi(z);

const OPEN_API_TAG = "Admin/Inquiries";

// --- Input Schemas ---

// 답변 작성 스키마
export const ReplyInquirySchema = z.object({
    answer: z.string().min(1, "답변 내용을 입력해주세요.").openapi({ example: "문의하신 내용은..." }),
});

// 관리자 목록 조회 쿼리 (사용자 검색 기능 포함)
export const AdminInquiryListQuerySchema = PaginationQuerySchema.extend({
    search: z.string().optional().openapi({ description: "제목, 내용, 작성자 이름/이메일 검색" }),
    type: InquiryTypeEnum.optional(),
    status: InquiryStatusEnum.optional(),
});

export type ReplyInquiryInput = z.infer<typeof ReplyInquirySchema>;
export type AdminInquiryListQuery = z.infer<typeof AdminInquiryListQuerySchema>;

// --- OpenAPI Registry ---

registry.registerPath({
    method: "get",
    path: "/admin/inquiries",
    tags: [OPEN_API_TAG],
    summary: "전체 문의 목록 조회 (관리자용)",
    description: "모든 사용자의 문의를 조회하고 검색합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        query: AdminInquiryListQuerySchema,
    },
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
    path: "/admin/inquiries/{id}",
    tags: [OPEN_API_TAG],
    summary: "문의 상세 조회",
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: { description: "조회 성공", content: { "application/json": { schema: z.object({ data: InquiryResponseSchema }) } } },
    },
});

registry.registerPath({
    method: "post",
    path: "/admin/inquiries/{id}/reply",
    tags: [OPEN_API_TAG],
    summary: "문의 답변 등록/수정",
    description: "답변을 등록하면 상태가 ANSWERED로 변경됩니다.",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ id: z.string() }),
        body: { content: { "application/json": { schema: ReplyInquirySchema } } },
    },
    responses: {
        200: { description: "답변 등록 성공" },
        404: { description: "문의 없음" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/admin/inquiries/{id}",
    tags: [OPEN_API_TAG],
    summary: "문의 삭제",
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string() }) },
    responses: {
        200: { description: "삭제 성공" },
    },
});