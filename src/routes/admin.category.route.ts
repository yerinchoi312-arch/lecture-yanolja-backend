import { Router } from "express";
import multer from "multer";
import { AdminCategoryController } from "../controllers/admin.category.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { CreateCategorySchema, CreateSubCategorySchema } from "../schemas/admin.category.schema";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
const controller = new AdminCategoryController();

router.use(authenticateJwt, isAdmin);

router.post(
    "/",
    upload.single("image"),
    validateBody(CreateCategorySchema),
    controller.createCategory,
);
router.post("/sub", validateBody(CreateSubCategorySchema), controller.createSubCategory);
router.delete("/:id", controller.deleteCategory);
router.delete("/sub/:id", controller.deleteSubCategory);

export default router;
