import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { CreateReviewSchema, UpdateReviewSchema } from "../schemas/review.schema";

const router = Router();
const controller = new ReviewController();

// 1. 공개 라우트 (로그인 없이 조회 가능)
router.get("/", controller.getReviews);

// 2. 인증이 필요한 라우트
router.use(authenticateJwt);

router.post("/", validateBody(CreateReviewSchema), controller.createReview);
router.get("/me", controller.getMyReviews);
router.put("/:id", validateBody(UpdateReviewSchema), controller.updateReview);
router.delete("/:id", controller.deleteReview);

export default router;
