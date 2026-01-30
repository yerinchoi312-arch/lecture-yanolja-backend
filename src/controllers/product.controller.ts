import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { ProductQuery } from "../schemas/product.schema";

const productService = new ProductService();

export class ProductController {
    async getProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const query: ProductQuery = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
                subCategoryId: req.query.subCategoryId
                    ? Number(req.query.subCategoryId)
                    : undefined,
                keyword: req.query.keyword ? String(req.query.keyword) : undefined,
            };

            const { total, products } = await productService.getProducts(query);
            const totalPages = Math.ceil(total / query.limit);

            res.status(200).json({
                data: products,
                pagination: {
                    totalItems: total,
                    totalPages: totalPages,
                    currentPage: query.page,
                    limit: query.limit,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getProductById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                throw new Error("유효하지 않은 상품 ID입니다.");
            }

            const product = await productService.getProductById(id);

            res.status(200).json({
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }
}
