import { Request, Response, NextFunction } from "express";
import { InquiryService } from "../services/inquiry.service";
import { InquiryListQuery } from "../schemas/inquiry.schema";

const inquiryService = new InquiryService();

export class InquiryController {
    async createInquiry(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const result = await inquiryService.createInquiry(userId, req.body);

            res.status(201).json({
                message: "문의가 등록되었습니다.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyInquiries(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;

            // 쿼리 파라미터 매핑
            const query: InquiryListQuery = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                type: req.query.type as any,
                status: req.query.status as any,
            };

            const result = await inquiryService.getMyInquiries(userId, query);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getInquiryDetail(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const inquiryId = Number(req.params.id);

            const result = await inquiryService.getInquiryDetail(userId, inquiryId);

            res.status(200).json({
                message: "문의 상세 조회 성공",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateInquiry(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const inquiryId = Number(req.params.id);

            const result = await inquiryService.updateInquiry(userId, inquiryId, req.body);

            res.status(200).json({
                message: "문의 내용이 수정되었습니다.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteInquiry(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const inquiryId = Number(req.params.id);

            await inquiryService.deleteInquiry(userId, inquiryId);

            res.status(200).json({
                message: "문의 내역이 삭제되었습니다.",
            });
        } catch (error) {
            next(error);
        }
    }
}
