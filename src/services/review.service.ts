import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { CreateReviewInput, ReviewListQuery, UpdateReviewInput } from "../schemas/review.schema";
import { Prisma } from "@prisma/client";

export class ReviewService {
    async createReview(userId: number, data: CreateReviewInput) {
        // 1. 객실 정보 확인 (productId를 가져오기 위함)
        const roomType = await prisma.roomType.findUnique({
            where: { id: data.roomTypeId },
        });

        if (!roomType) {
            throw new HttpException(404, "존재하지 않는 객실 타입입니다.");
        }

        const hasOrder = await prisma.order.findFirst({
            where: { userId, status: "PAID", items: { some: { roomTypeId: data.roomTypeId } } },
        });
        if (!hasOrder)
            throw new HttpException(403, "이용 내역이 있는 경우에만 리뷰를 작성할 수 있습니다.");

        return await prisma.review.create({
            data: {
                userId,
                roomTypeId: data.roomTypeId,
                productId: roomType.productId, // 객실의 부모 상품 ID 자동 연결
                content: data.content,
                rating: data.rating,
                images: {
                    create: data.images?.map(url => ({ url })) || [],
                },
            },
            include: {
                user: { select: { name: true } },
                roomType: { select: { id: true, name: true } },
                images: true,
            },
        });
    }

    async getReviews(query: ReviewListQuery) {
        const { page, limit, productId, roomTypeId, sort } = query;
        const skip = (page - 1) * limit;

        const whereInput: Prisma.ReviewWhereInput = {};

        if (productId) whereInput.productId = productId;
        if (roomTypeId) whereInput.roomTypeId = roomTypeId;

        // 정렬 조건
        let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: "desc" };
        if (sort === "rating_desc") orderBy = { rating: "desc" };
        if (sort === "rating_asc") orderBy = { rating: "asc" };

        const [total, reviews] = await Promise.all([
            prisma.review.count({ where: whereInput }),
            prisma.review.findMany({
                where: whereInput,
                include: {
                    user: { select: { name: true } },
                    roomType: { select: { id: true, name: true } },
                    product: { select: { id: true, name: true } },
                    images: true,
                },
                orderBy,
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

    async getMyReviews(userId: number, query: ReviewListQuery) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const [total, reviews] = await Promise.all([
            prisma.review.count({ where: { userId } }),
            prisma.review.findMany({
                where: { userId },
                include: {
                    user: { select: { name: true } },
                    roomType: { select: { id: true, name: true } },
                    product: { select: { id: true, name: true } },
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

    async updateReview(userId: number, reviewId: number, data: UpdateReviewInput) {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });

        if (!review) throw new HttpException(404, "리뷰를 찾을 수 없습니다.");
        if (review.userId !== userId)
            throw new HttpException(403, "본인의 리뷰만 수정할 수 있습니다.");

        // 이미지 업데이트 로직: 기존 이미지 삭제 후 재생성 (간단한 방식)
        const updateData: Prisma.ReviewUpdateInput = {
            content: data.content,
            rating: data.rating,
        };

        if (data.images) {
            updateData.images = {
                deleteMany: {},
                create: data.images.map((url: string) => ({ url })),
            };
        }

        return await prisma.review.update({
            where: { id: reviewId },
            data: updateData,
            include: { images: true },
        });
    }

    async deleteReview(userId: number, reviewId: number) {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });

        if (!review) throw new HttpException(404, "리뷰를 찾을 수 없습니다.");
        if (review.userId !== userId)
            throw new HttpException(403, "본인의 리뷰만 삭제할 수 있습니다.");

        await prisma.review.delete({ where: { id: reviewId } });
    }
}
