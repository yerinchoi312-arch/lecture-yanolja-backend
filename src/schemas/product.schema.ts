import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

// 상품 기본 응답 스키마
export const ProductResponseSchema = z
    .object({
        id: z.number().openapi({ example: 100 }),
        name: z.string().openapi({ example: "오션뷰 디럭스 룸 1박" }),
        createdAt: z.date().optional(),
    })
    .openapi("ProductResponse");
