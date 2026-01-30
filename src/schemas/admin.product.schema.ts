import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const CreateRoomTypeSchema = z.object({
    name: z.string().min(1, "객실 이름은 필수입니다."),
    description: z.string(),
    image: z.url("객실 이미지 URL 형식이 올바르지 않습니다."),
    originPrice: z.number().int().min(0),
    price: z.number().int().min(0),
});

export const CreateProductSchema = z.object({
    categoryId: z.number().int(),
    subCategoryId: z.number().int(),
    name: z.string().min(1, "상품 이름은 필수입니다."),
    address: z.string().min(1, "주소는 필수입니다."),
    description: z.string(),
    notice: z.string(),

    images: z.array(z.url()).min(1, "최소 1장의 이미지가 필요합니다."),

    roomTypes: z.array(CreateRoomTypeSchema).min(1, "최소 1개의 객실 타입이 필요합니다."),
});

export const UpdateProductSchema = z.object({
    categoryId: z.number().int().optional(),
    subCategoryId: z.number().int().optional(),
    name: z.string().optional(),
    address: z.string().optional(),
    description: z.string().optional(),
    notice: z.string().optional(),

    images: z.array(z.url()).optional(),
});

export const RoomTypeParamsSchema = z.object({
    roomId: z.coerce.number().min(1, "객실 ID는 1 이상의 숫자여야 합니다."),
});

export const UpdateRoomTypeSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    image: z.url("유효한 이미지 URL이 아닙니다.").optional(),
    originPrice: z.number().int().min(0).optional(),
    price: z.number().int().min(0).optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type UpdateRoomTypeInput = z.infer<typeof UpdateRoomTypeSchema>;