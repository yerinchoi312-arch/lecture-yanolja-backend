import { Router } from "express";
import { InquiryController } from "../controllers/inquiry.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { CreateInquirySchema, UpdateInquirySchema } from "../schemas/inquiry.schema";

const router = Router();
const controller = new InquiryController();

// 모든 문의 기능은 로그인이 필요합니다.
router.use(authenticateJwt);

router.post("/", validateBody(CreateInquirySchema), controller.createInquiry);
router.get("/", controller.getMyInquiries);
router.get("/:id", controller.getInquiryDetail);
router.put("/:id", validateBody(UpdateInquirySchema), controller.updateInquiry);
router.delete("/:id", controller.deleteInquiry);

export default router;
