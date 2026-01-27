import { Request, Response, NextFunction } from "express";
import { AdminCategoryService } from "../services/admin.category.service";

const adminCategoryService = new AdminCategoryService();

export class AdminCategoryController {
    async createCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminCategoryService.createCategory(req.body, req.file);

            res.status(201).json({
                message: "1차 카테고리가 생성되었습니다.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async createSubCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminCategoryService.createSubCategory(req.body);

            res.status(201).json({
                message: "2차 카테고리가 생성되었습니다.",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            await adminCategoryService.deleteCategory(id);
            res.status(200).json({ message: "1차 카테고리가 삭제되었습니다." });
        } catch (error) {
            next(error);
        }
    }

    async deleteSubCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            await adminCategoryService.deleteSubCategory(id);
            res.status(200).json({ message: "2차 카테고리가 삭제되었습니다." });
        } catch (error) {
            next(error);
        }
    }
}