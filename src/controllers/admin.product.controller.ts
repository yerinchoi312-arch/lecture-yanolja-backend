import { Request, Response, NextFunction } from "express";
import { AdminProductService } from "../services/admin.product.service";
import {
    CreateProductInput,
    UpdateProductInput,
    UpdateRoomTypeInput,
} from "../schemas/admin.product.schema";

const adminProductService = new AdminProductService();

export class AdminProductController {
    async createProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as CreateProductInput;

            const product = await adminProductService.createProduct(body);

            res.status(201).json({
                message: "상품이 성공적으로 등록되었습니다.",
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as UpdateProductInput;

            if (isNaN(id)) throw new Error("유효하지 않은 상품 ID입니다.");

            const product = await adminProductService.updateProduct(id, body);

            res.status(200).json({
                message: "상품 정보가 수정되었습니다.",
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) throw new Error("유효하지 않은 상품 ID입니다.");

            await adminProductService.deleteProduct(id);

            res.status(200).json({
                message: "상품이 삭제되었습니다.",
            });
        } catch (error) {
            next(error);
        }
    }

    async updateRoomType(req: Request, res: Response, next: NextFunction) {
        try {
            const roomId = Number(req.params.roomId);
            const body = req.body as UpdateRoomTypeInput;

            if (isNaN(roomId)) throw new Error("유효하지 않은 객실 ID입니다.");

            const updatedRoom = await adminProductService.updateRoomType(roomId, body);

            res.status(200).json({
                message: "객실 정보가 수정되었습니다.",
                data: updatedRoom,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteRoomType(req: Request, res: Response, next: NextFunction) {
        try {
            const roomId = Number(req.params.roomId);

            if (isNaN(roomId)) throw new Error("유효하지 않은 객실 ID입니다.");

            await adminProductService.deleteRoomType(roomId);

            res.status(200).json({
                message: "객실이 삭제되었습니다.",
            });
        } catch (error) {
            next(error);
        }
    }
}
