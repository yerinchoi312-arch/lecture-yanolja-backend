import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { validateParams, validateQuery } from "../middlewares/validation.middleware";
import { ProductParamsSchema, ProductQuerySchema } from "../schemas/product.schema";

const router = Router();
const controller = new ProductController();

router.get("/", validateQuery(ProductQuerySchema), controller.getProducts);
router.get("/:id", validateParams(ProductParamsSchema), controller.getProductById);

export default router;
