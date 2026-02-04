import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { CreateInquiryInput, InquiryListQuery, UpdateInquiryInput, } from "../schemas/inquiry.schema";

export class InquiryService {
    async createInquiry(userId: number, data: CreateInquiryInput) {
        return await prisma.inquiry.create({
            data: {
                userId,
                type: data.type,
                title: data.title,
                content: data.content,
                status: "PENDING",
                images: {
                    create: data.images?.map((url: string) => ({ url })) || [],
                },
            },
            include: {
                images: true,
            },
        });
    }

    async getMyInquiries(userId: number, query: InquiryListQuery) {
        const { page, limit, type, status } = query;
        const skip = (page - 1) * limit;

        const whereInput: Prisma.InquiryWhereInput = {
            userId,
        };

        if (type) whereInput.type = type;
        if (status) whereInput.status = status;

        const [total, inquiries] = await Promise.all([
            prisma.inquiry.count({ where: whereInput }),
            prisma.inquiry.findMany({
                where: whereInput,
                include: { images: true },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
        ]);

        return {
            data: inquiries,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            },
        };
    }

    async getInquiryDetail(userId: number, inquiryId: number) {
        const inquiry = await prisma.inquiry.findUnique({
            where: { id: inquiryId },
            include: { images: true },
        });

        if (!inquiry) throw new HttpException(404, "문의 내역을 찾을 수 없습니다.");
        if (inquiry.userId !== userId)
            throw new HttpException(403, "본인의 문의 내역만 확인할 수 있습니다.");

        return inquiry;
    }

    async updateInquiry(userId: number, inquiryId: number, data: UpdateInquiryInput) {
        const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });

        if (!inquiry) throw new HttpException(404, "문의 내역을 찾을 수 없습니다.");
        if (inquiry.userId !== userId) throw new HttpException(403, "권한이 없습니다.");

        // [중요] 이미 답변이 달린 경우 수정 불가 처리
        if (inquiry.status === "ANSWERED") {
            throw new HttpException(400, "답변이 완료된 문의는 수정할 수 없습니다.");
        }

        const updateData: Prisma.InquiryUpdateInput = {
            type: data.type,
            title: data.title,
            content: data.content,
        };

        // 이미지 수정 로직 (기존 삭제 -> 재생성)
        if (data.images) {
            updateData.images = {
                deleteMany: {},
                create: data.images.map((url: string) => ({ url })),
            };
        }

        return await prisma.inquiry.update({
            where: { id: inquiryId },
            data: updateData,
            include: { images: true },
        });
    }

    async deleteInquiry(userId: number, inquiryId: number) {
        const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });

        if (!inquiry) throw new HttpException(404, "문의 내역을 찾을 수 없습니다.");
        if (inquiry.userId !== userId) throw new HttpException(403, "권한이 없습니다.");

        await prisma.inquiry.delete({ where: { id: inquiryId } });
    }
}
