import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { ConfirmPaymentInput, CreateOrderInput } from "../schemas/order.schema";
import { PaginationQuery } from "../schemas/common.schema";
import axios from "axios";
import { Prisma } from "@prisma/client";

export class OrderService {
    async createOrder(userId: number, data: CreateOrderInput) {
        const checkIn = new Date(data.checkInDate);
        const checkOut = new Date(data.checkOutDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (checkIn < now) throw new HttpException(400, "체크인 날짜 오류");
        if (checkOut <= checkIn) throw new HttpException(400, "체크아웃 날짜 오류");

        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let totalPrice = 0;
        let firstRoomName = ""; // 주문명(OrderName) 생성을 위함
        const orderItemsData: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];

        for (const [index, item] of data.items.entries()) {
            const roomType = await prisma.roomType.findUnique({ where: { id: item.roomTypeId } });
            if (!roomType) throw new HttpException(404, "객실 타입 없음");

            const itemTotalPrice = roomType.price * item.quantity * nights;
            totalPrice += itemTotalPrice;

            if (index === 0) firstRoomName = roomType.name;

            orderItemsData.push({
                roomTypeId: item.roomTypeId,
                quantity: item.quantity,
                price: itemTotalPrice,
            });
        }

        const orderName =
            data.items.length > 1
                ? `${firstRoomName} 외 ${data.items.length - 1}건`
                : firstRoomName;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        const order = await prisma.$transaction(async tx => {
            return await tx.order.create({
                data: {
                    userId,
                    recipientName: data.recipientName,
                    recipientPhone: data.recipientPhone,
                    adultNum: data.adultNum,
                    childrenNum: data.childrenNum,
                    checkInDate: checkIn,
                    checkOutDate: checkOut,
                    totalPrice,
                    status: "PENDING",
                    items: { create: orderItemsData },
                },
            });
        });

        // PG 연동에 필요한 데이터 반환
        return {
            orderId: order.id,
            totalPrice,
            orderName,
            customerEmail: user?.email || "",
            customerName: user?.name || "",
        };
    }

    // 2. 결제 승인 (토스페이먼츠 연동)
    async confirmPayment(userId: number, data: ConfirmPaymentInput) {
        const { paymentKey, orderId, amount } = data;

        // 2-1. 주문 정보 확인 (금액 검증)
        const order = await prisma.order.findUnique({
            where: { id: Number(orderId) },
        });

        if (!order) throw new HttpException(404, "주문을 찾을 수 없습니다.");
        if (order.totalPrice !== amount) {
            throw new HttpException(400, "결제 금액이 주문 금액과 일치하지 않습니다.");
        }
        if (order.status === "PAID") {
            throw new HttpException(400, "이미 처리된 주문입니다.");
        }

        // 2-2. 토스페이먼츠 승인 API 호출
        const widgetSecretKey = process.env.TOSS_SECRET_KEY;
        const encryptedSecretKey = Buffer.from(`${widgetSecretKey}:`).toString("base64");

        try {
            const response = await axios.post(
                "https://api.tosspayments.com/v1/payments/confirm",
                {
                    orderId: String(orderId),
                    amount,
                    paymentKey,
                },
                {
                    headers: {
                        Authorization: `Basic ${encryptedSecretKey}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            // Axios는 response.data에 실제 응답 본문이 들어있습니다.
            const paymentData = response.data;

            // 3. DB 업데이트
            const paymentMethod = paymentData.method || "간편결제";

            await prisma.$transaction([
                prisma.order.update({
                    where: { id: order.id },
                    data: { status: "PAID" },
                }),
                prisma.payment.create({
                    data: {
                        orderId: order.id,
                        method: paymentMethod,
                        amount: paymentData.totalAmount,
                        status: "PAID",
                        requestedAt: new Date(paymentData.requestedAt),
                        approvedAt: new Date(paymentData.approvedAt),
                    },
                }),
            ]);

            return paymentData;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                // 토스 API가 400, 500 에러를 뱉었을 때 여기로 들어옵니다.
                const status = error.response?.status || 500;
                const message = error.response?.data?.message || "결제 승인 실패";
                const code = error.response?.data?.code || "UNKNOWN_ERROR";

                // 에러 메시지와 토스 에러 코드를 함께 보여주면 디버깅에 좋습니다.
                throw new HttpException(status, `${message} (${code})`);
            }

            // 일반적인 서버 에러
            throw new HttpException(500, "결제 서버 연동 중 알 수 없는 오류 발생");
        }
    }

    // 3. 내 주문 목록
    async getMyOrders(userId: number, query: PaginationQuery) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const [total, orders] = await Promise.all([
            prisma.order.count({ where: { userId } }),
            prisma.order.findMany({
                where: { userId },
                include: { items: { include: { roomType: true } } },
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

    // 4. 주문 상세
    async getOrderDetail(userId: number, orderId: number) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { roomType: true } } },
        });

        if (!order || order.userId !== userId) {
            throw new HttpException(404, "주문을 찾을 수 없거나 권한이 없습니다.");
        }
        return order;
    }
}
