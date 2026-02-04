import { Router } from "express";
import { AdminOrderController } from "../controllers/admin.order.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { UpdateOrderStatusSchema } from "../schemas/admin.order.schema";

const router = Router();
const controller = new AdminOrderController();

router.use(authenticateJwt, isAdmin);

router.get("/", controller.getAllOrders);
router.get("/:id", controller.getOrderDetail);
router.patch("/:id/status", validateBody(UpdateOrderStatusSchema), controller.updateOrderStatus);

export default router;
