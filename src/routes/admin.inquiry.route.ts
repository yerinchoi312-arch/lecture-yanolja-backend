import { Router } from "express";
import { AdminInquiryController } from "../controllers/admin.inquiry.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { ReplyInquirySchema } from "../schemas/admin.inquiry.schema";

const router = Router();
const controller = new AdminInquiryController();

// 관리자 권한 미들웨어 적용
router.use(authenticateJwt, isAdmin);

router.get("/", controller.getAllInquiries);
router.get("/:id", controller.getInquiryDetail);
router.post("/:id/reply", validateBody(ReplyInquirySchema), controller.replyInquiry);
router.delete("/:id", controller.deleteInquiry);

export default router;
