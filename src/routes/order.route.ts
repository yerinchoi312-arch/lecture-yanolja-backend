import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import {
    CreateOrderSchema,
    ConfirmPaymentSchema,
    CancelOrderSchema,
} from "../schemas/order.schema";

const router = Router();
const controller = new OrderController();

router.use(authenticateJwt);

router.post("/", validateBody(CreateOrderSchema), controller.createOrder);
router.post("/confirm", validateBody(ConfirmPaymentSchema), controller.confirmPayment); // 결제 승인 라우트
router.get("/", controller.getMyOrders);
router.get("/:id", controller.getOrderDetail);
router.post("/:id/cancel", validateBody(CancelOrderSchema), controller.cancelOrder);

export default router;
