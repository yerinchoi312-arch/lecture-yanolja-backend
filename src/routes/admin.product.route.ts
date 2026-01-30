import { Router } from "express";
import { AdminProductController } from "../controllers/admin.product.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import {
    CreateProductSchema,
    RoomTypeParamsSchema,
    UpdateProductSchema,
    UpdateRoomTypeSchema,
} from "../schemas/admin.product.schema";
import { ProductParamsSchema } from "../schemas/product.schema";

const router = Router();
const controller = new AdminProductController();

router.use(authenticateJwt, isAdmin);

router.post("/", validateBody(CreateProductSchema), controller.createProduct);
router.put(
    "/:id",
    validateParams(ProductParamsSchema),
    validateBody(UpdateProductSchema),
    controller.updateProduct,
);
router.delete("/:id", validateParams(ProductParamsSchema), controller.deleteProduct);
router.put(
    "/room-types/:roomId",
    validateParams(RoomTypeParamsSchema),
    validateBody(UpdateRoomTypeSchema),
    controller.updateRoomType,
);
router.delete(
    "/room-types/:roomId",
    validateParams(RoomTypeParamsSchema),
    controller.deleteRoomType,
);

export default router;
