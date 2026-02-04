import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";

extendZodWithOpenApi(z);

const OPEN_API_TAG = "Admin/Products";

// --- Sub Schemas ---

export const CreateRoomTypeSchema = z.object({
    name: z.string().min(1, "객실 이름은 필수입니다.").openapi({ example: "디럭스 룸" }),
    description: z.string().openapi({ example: "넓고 쾌적한 객실입니다." }),
    image: z.url("객실 이미지 URL 형식이 올바르지 않습니다.").openapi({ example: "https://example.com/room.jpg" }),
    originPrice: z.number().int().min(0).openapi({ example: 200000, description: "정상가" }),
    price: z.number().int().min(0).openapi({ example: 180000, description: "판매가" }),
});

export const CreateProductSchema = z.object({
    categoryId: z.number().int().openapi({ example: 1, description: "1차 카테고리 ID" }),
    subCategoryId: z.number().int().openapi({ example: 2, description: "2차 카테고리 ID" }),
    name: z.string().min(1, "상품 이름은 필수입니다.").openapi({ example: "신라호텔" }),
    address: z.string().min(1, "주소는 필수입니다.").openapi({ example: "서울시 중구" }),
    description: z.string().openapi({ example: "최고급 호텔입니다." }),
    notice: z.string().openapi({ example: "체크인은 15시입니다." }),

    // 이미지를 별도 업로드 API로 올린 후 URL 문자열 배열을 보낸다고 가정
    images: z.array(z.url()).min(1, "최소 1장의 이미지가 필요합니다.").openapi({
        example: ["https://example.com/hotel1.jpg", "https://example.com/hotel2.jpg"],
    }),

    roomTypes: z.array(CreateRoomTypeSchema).min(1, "최소 1개의 객실 타입이 필요합니다."),
});

export const UpdateProductSchema = z.object({
    categoryId: z.number().int().optional().openapi({ example: 1 }),
    subCategoryId: z.number().int().optional().openapi({ example: 2 }),
    name: z.string().optional().openapi({ example: "수정된 호텔 이름" }),
    address: z.string().optional().openapi({ example: "수정된 주소" }),
    description: z.string().optional(),
    notice: z.string().optional(),
    images: z.array(z.url()).optional().openapi({ example: ["https://new-image.com/1.jpg"] }),
});

export const RoomTypeParamsSchema = z.object({
    roomId: z.coerce.number().min(1, "객실 ID는 1 이상의 숫자여야 합니다.").openapi({ example: 1 }),
});

export const UpdateRoomTypeSchema = z.object({
    name: z.string().optional().openapi({ example: "수정된 객실명" }),
    description: z.string().optional(),
    image: z.url("유효한 이미지 URL이 아닙니다.").optional(),
    originPrice: z.number().int().min(0).optional(),
    price: z.number().int().min(0).optional(),
});

// --- Types ---

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type UpdateRoomTypeInput = z.infer<typeof UpdateRoomTypeSchema>;

// --- OpenAPI Registry ---

// 1. 상품 생성 (객실 포함)
registry.registerPath({
    method: "post",
    path: "/admin/products",
    tags: [OPEN_API_TAG],
    summary: "상품 및 객실 등록",
    description: "상품 기본 정보와 하위 객실(RoomType)들을 한 번에 등록합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: CreateProductSchema },
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
                        data: z.object({ id: z.number() }), // 생성된 상품 ID 반환 예상
                    }),
                },
            },
        },
        400: { description: "입력값 유효성 검사 실패" },
    },
});

// 2. 상품 수정
registry.registerPath({
    method: "put",
    path: "/admin/products/{id}",
    tags: [OPEN_API_TAG],
    summary: "상품 정보 수정",
    description: "상품의 기본 정보를 수정합니다. (객실 정보 제외)",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ id: z.string().openapi({ example: "1", description: "상품 ID" }) }),
        body: {
            content: {
                "application/json": { schema: UpdateProductSchema },
            },
        },
    },
    responses: {
        200: { description: "수정 성공" },
        404: { description: "상품을 찾을 수 없음" },
    },
});

// 3. 상품 삭제
registry.registerPath({
    method: "delete",
    path: "/admin/products/{id}",
    tags: [OPEN_API_TAG],
    summary: "상품 삭제",
    description: "상품과 연결된 모든 객실, 리뷰, 장바구니 항목이 함께 삭제될 수 있습니다.",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ id: z.string().openapi({ example: "1", description: "상품 ID" }) }),
    },
    responses: {
        200: { description: "삭제 성공" },
        404: { description: "상품을 찾을 수 없음" },
    },
});

// 4. 객실(RoomType) 수정
registry.registerPath({
    method: "put",
    path: "/admin/products/room-types/{roomId}",
    tags: [OPEN_API_TAG],
    summary: "특정 객실(RoomType) 수정",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ roomId: z.string().openapi({ example: "10", description: "객실 타입 ID" }) }),
        body: {
            content: {
                "application/json": { schema: UpdateRoomTypeSchema },
            },
        },
    },
    responses: {
        200: { description: "수정 성공" },
        404: { description: "객실을 찾을 수 없음" },
    },
});

// 5. 객실(RoomType) 삭제
registry.registerPath({
    method: "delete",
    path: "/admin/products/room-types/{roomId}",
    tags: [OPEN_API_TAG],
    summary: "특정 객실(RoomType) 삭제",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ roomId: z.string().openapi({ example: "10", description: "객실 타입 ID" }) }),
    },
    responses: {
        200: { description: "삭제 성공" },
        404: { description: "객실을 찾을 수 없음" },
    },
});