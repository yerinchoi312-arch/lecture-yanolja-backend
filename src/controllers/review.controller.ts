import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service";
import { ReviewListQuery } from "../schemas/review.schema";

const reviewService = new ReviewService();

export class ReviewController {
    async createReview(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const result = await reviewService.createReview(userId, req.body);

            res.status(201).json({
                message: "리뷰가 작성되었습니다.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const query: ReviewListQuery = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                productId: req.query.productId ? Number(req.query.productId) : undefined,
                roomTypeId: req.query.roomTypeId ? Number(req.query.roomTypeId) : undefined,
                sort: (req.query.sort as any) || "latest",
            };

            const result = await reviewService.getReviews(query);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getMyReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const query: ReviewListQuery = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                sort: "latest",
            };

            const result = await reviewService.getMyReviews(userId, query);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateReview(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const reviewId = Number(req.params.id);
            const result = await reviewService.updateReview(userId, reviewId, req.body);

            res.status(200).json({
                message: "리뷰가 수정되었습니다.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteReview(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const reviewId = Number(req.params.id);
            await reviewService.deleteReview(userId, reviewId);

            res.status(200).json({
                message: "리뷰가 삭제되었습니다.",
            });
        } catch (error) {
            next(error);
        }
    }
}