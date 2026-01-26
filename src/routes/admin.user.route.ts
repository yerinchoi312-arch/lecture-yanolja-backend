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

router.get("/users", validateQuery(PaginationQuerySchema), adminUserController.getUsers);
router.get("/users/:id", validateParams(UserParamSchema), adminUserController.getUser);
router.post("/users", validateBody(CreateUserInputSchema), adminUserController.createUser);
router.put(
    "/users/:id",
    validateParams(UserParamSchema),
    validateBody(UpdateUserInputSchema),
    adminUserController.updateUser,
);
router.delete("/users/:id", validateParams(UserParamSchema), adminUserController.deleteUser);

export default router;
