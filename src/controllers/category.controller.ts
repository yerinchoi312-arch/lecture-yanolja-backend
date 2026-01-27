import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";

const categoryService = new CategoryService();

export class CategoryController {
    async getCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await categoryService.getAllCategories();

            res.status(200).json({
                message: "카테고리 목록 조회 성공",
                data: categories,
            });
        } catch (error) {
            next(error);
        }
    }

    async getSubCategoryDetail(
        req: Request<{ path: string; subId: string }>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { path, subId } = req.params;

            const parsedSubId = Number(subId);
            if (isNaN(parsedSubId)) {
                throw new Error("SubCategory ID must be a number");
            }

            const result = await categoryService.getSubCategoryByPathAndId(path, parsedSubId);

            res.status(200).json({
                message: "카테고리 상세 조회 성공",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}
