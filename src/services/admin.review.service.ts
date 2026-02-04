import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { AdminReviewListQuery } from "../schemas/admin.review.schema";

export class AdminReviewService {
    async getAllReviews(query: AdminReviewListQuery) {
        const { page, limit, search, productId, roomTypeId, rating } = query;
        const skip = (page - 1) * limit;

        const whereInput: Prisma.ReviewWhereInput = {};

        // 필터링
        if (productId) whereInput.productId = productId;
        if (roomTypeId) whereInput.roomTypeId = roomTypeId;
        if (rating) whereInput.rating = rating;

        // 검색 (리뷰 내용 or 작성자 이름)
        if (search) {
            whereInput.OR = [
                { content: { contains: search } },
                { user: { name: { contains: search } } },
                { user: { username: { contains: search } } },
            ];
        }

        const [total, reviews] = await Promise.all([
            prisma.review.count({ where: whereInput }),
            prisma.review.findMany({
                where: whereInput,
                include: {
                    user: { select: { id: true, name: true, email: true } }, // 관리자는 이메일도 볼 수 있게 확장 가능
                    roomType: { select: { id: true, name: true } },
                    images: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
        ]);

        return {
            data: reviews,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            },
        };
    }

    async deleteReview(id: number) {
        const review = await prisma.review.findUnique({ where: { id } });

        if (!review) {
            throw new HttpException(404, "리뷰를 찾을 수 없습니다.");
        }

        await prisma.review.delete({ where: { id } });
    }
}