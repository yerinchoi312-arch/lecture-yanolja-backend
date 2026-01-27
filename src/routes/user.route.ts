import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { UpdateProfileSchema, ChangePasswordSchema } from "../schemas/user.schema";
import { authenticateJwt } from "../middlewares/auth.middleware";

const userRoute = Router();
const userController = new UserController();

userRoute.use(authenticateJwt);

userRoute.put("/me", validateBody(UpdateProfileSchema), userController.updateProfile);
userRoute.patch("/me/password", validateBody(ChangePasswordSchema), userController.changePassword);

export default userRoute;
