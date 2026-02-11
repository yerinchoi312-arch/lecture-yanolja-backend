import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { PaginationQuery } from "../schemas/common.schema";

const orderService = new OrderService();

export class OrderController {
    async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            // 생성된 데이터는 프론트에서 토스 위젯을 띄우는 데 사용됨
            const result = await orderService.createOrder(userId, req.body);

            res.status(201).json({
                message: "주문 대기가 생성되었습니다. 결제를 진행해주세요.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async confirmPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            // 프론트엔드가 토스 결제 성공 후 보내준 데이터 처리
            const result = await orderService.confirmPayment(userId, req.body);

            res.status(200).json({
                message: "결제가 정상적으로 승인되었습니다.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const query: PaginationQuery = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
            };

            const result = await orderService.getMyOrders(userId, query);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getOrderDetail(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const orderId = Number(req.params.id);

            const result = await orderService.getOrderDetail(userId, orderId);

            res.status(200).json({
                message: "주문 상세 조회 성공",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async cancelOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const orderId = Number(req.params.id);
            const result = await orderService.cancelOrder(userId, orderId, req.body);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}