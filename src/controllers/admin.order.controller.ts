import { Request, Response, NextFunction } from "express";
import { AdminOrderService } from "../services/admin.order.service";
import { AdminOrderListQuery } from "../schemas/admin.order.schema";

const adminOrderService = new AdminOrderService();

export class AdminOrderController {
    async getAllOrders(req: Request, res: Response, next: NextFunction) {
        try {
            // 쿼리 파라미터 파싱 및 타입 변환
            const query: AdminOrderListQuery = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                search: req.query.search as string,
                status: req.query.status as any,
                startDate: req.query.startDate
                    ? new Date(req.query.startDate as string)
                    : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
            };

            const result = await adminOrderService.getAllOrders(query);

            res.status(200).json({
                message: "전체 주문 목록 조회 성공",
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getOrderDetail(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await adminOrderService.getOrderDetail(id);

            res.status(200).json({
                message: "주문 상세 조회 성공",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await adminOrderService.updateOrderStatus(id, req.body);

            res.status(200).json({
                message: "주문 상태가 변경되었습니다.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}
