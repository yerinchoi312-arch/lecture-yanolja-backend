import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { ProductQuery } from "../schemas/product.schema";

export class ProductService {
    async getProducts(query: ProductQuery) {
        const { page, limit, categoryId, subCategoryId, keyword } = query;
        const skip = (page - 1) * limit;

        const whereClause: any = {};

        if (categoryId) whereClause.categoryId = categoryId;
        if (subCategoryId) whereClause.subCategoryId = subCategoryId;
        if (keyword) {
            whereClause.OR = [
                { name: { contains: keyword } },
                { address: { contains: keyword } },
            ];
        }

        const [total, products] = await prisma.$transaction([
            prisma.product.count({ where: whereClause }),
            prisma.product.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    categoryId: true,
                    subCategoryId: true,
                    name: true,
                    address: true,
                    images: {
                        take: 1,
                        select: { url: true }
                    },
                    roomTypes: {
                        take: 1,
                        orderBy: { price: "asc" },
                        select: { price: true }
                    },
                    reviews: {
                        select: { rating: true }
                    }
                }
            })
        ]);

        const formattedProducts = products.map(product => {
            const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
            const avg = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

            return {
                id: product.id,
                categoryId: product.categoryId,
                subCategoryId: product.subCategoryId,
                name: product.name,
                address: product.address,
                thumbnail: product.images[0]?.url || "",
                minPrice: product.roomTypes[0]?.price || 0,
                ratingAvg: Number(avg.toFixed(1)),
                reviewCount: product.reviews.length,
            };
        });

        return { total, products: formattedProducts };
    }

    async getProductById(id: number) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                images: { select: { url: true } },
                roomTypes: {
                    orderBy: { price: "asc" }
                },
                reviews: {
                    select: { rating: true }
                }
            }
        });

        if (!product) {
            throw new HttpException(404, "상품을 찾을 수 없습니다.");
        }

        const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

        return {
            id: product.id,
            categoryId: product.categoryId,
            subCategoryId: product.subCategoryId,
            name: product.name,
            address: product.address,
            description: product.description,
            notice: product.notice,
            images: product.images.map(img => img.url),
            roomTypes: product.roomTypes,
            ratingAvg: Number(avg.toFixed(1)),
            reviewCount: product.reviews.length,
        };
    }
}