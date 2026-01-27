import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";

export class CategoryService {
    async getAllCategories() {
        return await prisma.category.findMany({
            include: {
                subCategories: true,
            },
            orderBy: {
                id: "asc",
            },
        });
    }

    async getSubCategoryByPathAndId(path: string, subId: number) {
        const subCategory = await prisma.subCategory.findFirst({
            where: {
                id: subId,
                category: {
                    path: path,
                },
            },
            include: {
                category: true,
                products: true,
            },
        });

        if (!subCategory) {
            throw new HttpException(404, "해당 경로의 카테고리를 찾을 수 없습니다.");
        }

        return subCategory;
    }
}
