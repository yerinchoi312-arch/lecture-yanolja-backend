import { Request, Response, NextFunction } from "express";
import { AdminReviewService } from "../services/admin.review.service";
import { AdminReviewListQuery } from "../schemas/admin.review.schema";

const adminReviewService = new AdminReviewService();

export class AdminReviewController {
    async getAllReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const query: AdminReviewListQuery = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                search: req.query.search as string,
                productId: req.query.productId ? Number(req.query.productId) : undefined,
                roomTypeId: req.query.roomTypeId ? Number(req.query.roomTypeId) : undefined,
                rating: req.query.rating ? Number(req.query.rating) : undefined,
            };

            const result = await adminReviewService.getAllReviews(query);

            res.status(200).json({
                message: "전체 리뷰 목록 조회 성공",
                ...result, // data, pagination
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteReview(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            await adminReviewService.deleteReview(id);

            res.status(200).json({
                message: "리뷰가 삭제되었습니다.",
            });
        } catch (error) {
            next(error);
        }
    }
}
