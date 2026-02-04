import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { AdminOrderListQuery, UpdateOrderStatusInput } from "../schemas/admin.order.schema";

export class AdminOrderService {
    async getAllOrders(query: AdminOrderListQuery) {
        const { page, limit, search, status, startDate, endDate } = query;
        const skip = (page - 1) * limit;

        // 1. 동적 필터 조건 생성
        const whereInput: Prisma.OrderWhereInput = {};

        // 상태 필터
        if (status) {
            whereInput.status = status;
        }

        // 검색 (이름 또는 이메일 또는 주문자명)
        if (search) {
            whereInput.OR = [
                { recipientName: { contains: search } }, // 수령인 이름
                { user: { name: { contains: search } } }, // 회원 이름
                { user: { email: { contains: search } } }, // 회원 이메일
                { user: { username: { contains: search } } }, // 회원 아이디
            ];
        }

        // 날짜 범위 필터
        if (startDate || endDate) {
            whereInput.createdAt = {};
            if (startDate) whereInput.createdAt.gte = startDate;
            if (endDate) {
                // endDate의 23:59:59까지 포함하기 위해 날짜 조정이 필요할 수 있음
                // 여기서는 간단하게 해당 날짜 이후면 다음날 0시 전까지로 가정하거나 그대로 사용
                const nextDay = new Date(endDate);
                nextDay.setDate(nextDay.getDate() + 1);
                whereInput.createdAt.lt = nextDay;
            }
        }

        // 2. DB 조회
        const [total, orders] = await Promise.all([
            prisma.order.count({ where: whereInput }),
            prisma.order.findMany({
                where: whereInput,
                include: {
                    user: { select: { id: true, name: true, email: true, phone: true } }, // 주문자 정보 포함
                    items: {
                        include: { roomType: true },
                    },
                    payment: true, // 결제 정보 포함
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
        ]);

        return {
            data: orders,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            },
        };
    }

    async getOrderDetail(id: number) {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: true, // 모든 유저 정보
                items: { include: { roomType: true } },
                payment: true,
            },
        });

        if (!order) {
            throw new HttpException(404, "주문을 찾을 수 없습니다.");
        }

        return order;
    }

    async updateOrderStatus(id: number, data: UpdateOrderStatusInput) {
        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) throw new HttpException(404, "주문을 찾을 수 없습니다.");

        return await prisma.order.update({
            where: { id },
            data: { status: data.status },
        });
    }
}
