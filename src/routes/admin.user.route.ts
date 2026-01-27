import { Router } from "express";
import { AdminUserController } from "../controllers/admin.user.controller";
import { isAdmin } from "../middlewares/admin.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import {
    CreateUserInputSchema,
    PaginationQuerySchema,
    UpdateUserInputSchema,
    UserParamSchema,
} from "../schemas/admin.user.schema";

const router = Router();
const adminUserController = new AdminUserController();

router.use(authenticateJwt, isAdmin);

router.get("/", validateQuery(PaginationQuerySchema), adminUserController.getUsers);
router.get("/:id", validateParams(UserParamSchema), adminUserController.getUser);
router.post("/", validateBody(CreateUserInputSchema), adminUserController.createUser);
router.put(
    "/:id",
    validateParams(UserParamSchema),
    validateBody(UpdateUserInputSchema),
    adminUserController.updateUser,
);
router.delete("/:id", validateParams(UserParamSchema), adminUserController.deleteUser);

export default router;
