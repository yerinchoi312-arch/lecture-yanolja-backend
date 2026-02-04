import { Router } from "express";
import { AdminReviewController } from "../controllers/admin.review.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import "../schemas/admin.review.schema";

const router = Router();
const controller = new AdminReviewController();

// 관리자 권한 확인
router.use(authenticateJwt, isAdmin);

router.get("/", controller.getAllReviews);
router.delete("/:id", controller.deleteReview);

export default router;
