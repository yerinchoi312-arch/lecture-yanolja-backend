import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { AdminInquiryListQuery, ReplyInquiryInput } from "../schemas/admin.inquiry.schema";

export class AdminInquiryService {
    async getAllInquiries(query: AdminInquiryListQuery) {
        const { page, limit, search, type, status } = query;
        const skip = (page - 1) * limit;

        const whereInput: Prisma.InquiryWhereInput = {};

        if (type) whereInput.type = type;
        if (status) whereInput.status = status;

        if (search) {
            whereInput.OR = [
                { title: { contains: search } },
                { content: { contains: search } },
                { user: { name: { contains: search } } },
                { user: { email: { contains: search } } },
            ];
        }

        const [total, inquiries] = await Promise.all([
            prisma.inquiry.count({ where: whereInput }),
            prisma.inquiry.findMany({
                where: whereInput,
                include: {
                    user: { select: { id: true, name: true, email: true } }, // 작성자 정보 포함
                    images: true,
                },
                orderBy: { createdAt: "desc" }, // 최신순
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

    async getInquiryDetail(id: number) {
        const inquiry = await prisma.inquiry.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                images: true,
            },
        });

        if (!inquiry) {
            throw new HttpException(404, "문의 내역을 찾을 수 없습니다.");
        }

        return inquiry;
    }

    // 답변 등록 및 수정
    async replyInquiry(id: number, data: ReplyInquiryInput) {
        const inquiry = await prisma.inquiry.findUnique({ where: { id } });
        if (!inquiry) throw new HttpException(404, "문의 내역을 찾을 수 없습니다.");

        return await prisma.inquiry.update({
            where: { id },
            data: {
                answer: data.answer,
                status: "ANSWERED", // 상태 변경
                answeredAt: new Date(), // 답변 일시 업데이트
            },
        });
    }

    async deleteInquiry(id: number) {
        const inquiry = await prisma.inquiry.findUnique({ where: { id } });
        if (!inquiry) throw new HttpException(404, "문의 내역을 찾을 수 없습니다.");

        await prisma.inquiry.delete({ where: { id } });
    }
}
