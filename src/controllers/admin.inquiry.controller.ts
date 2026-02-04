import { Request, Response, NextFunction } from "express";
import { AdminInquiryService } from "../services/admin.inquiry.service";
import { AdminInquiryListQuery } from "../schemas/admin.inquiry.schema";

const adminInquiryService = new AdminInquiryService();

export class AdminInquiryController {
    async getAllInquiries(req: Request, res: Response, next: NextFunction) {
        try {
            const query: AdminInquiryListQuery = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                search: req.query.search as string,
                type: req.query.type as any,
                status: req.query.status as any,
            };

            const result = await adminInquiryService.getAllInquiries(query);

            res.status(200).json({
                message: "전체 문의 목록 조회 성공",
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getInquiryDetail(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await adminInquiryService.getInquiryDetail(id);

            res.status(200).json({
                message: "문의 상세 조회 성공",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async replyInquiry(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await adminInquiryService.replyInquiry(id, req.body);

            res.status(200).json({
                message: "답변이 등록되었습니다.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteInquiry(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            await adminInquiryService.deleteInquiry(id);

            res.status(200).json({
                message: "문의 내역이 삭제되었습니다.",
            });
        } catch (error) {
            next(error);
        }
    }
}
