import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { CreateProductInput, UpdateProductInput, UpdateRoomTypeInput, } from "../schemas/admin.product.schema";

export class AdminProductService {
    async createProduct(data: CreateProductInput) {
        const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
        if (!category) throw new HttpException(404, "존재하지 않는 카테고리입니다.");

        return await prisma.product.create({
            data: {
                categoryId: data.categoryId,
                subCategoryId: data.subCategoryId,
                name: data.name,
                address: data.address,
                description: data.description,
                notice: data.notice,

                images: {
                    create: data.images.map(url => ({ url })),
                },

                roomTypes: {
                    create: data.roomTypes.map(room => ({
                        name: room.name,
                        description: room.description,
                        image: room.image,
                        originPrice: room.originPrice,
                        price: room.price,
                    })),
                },
            },
            include: {
                images: true,
                roomTypes: true,
            },
        });
    }

    async updateProduct(id: number, data: UpdateProductInput) {
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) throw new HttpException(404, "수정할 상품이 없습니다.");

        const updateData: any = {
            categoryId: data.categoryId,
            subCategoryId: data.subCategoryId,
            name: data.name,
            address: data.address,
            description: data.description,
            notice: data.notice,
        };

        if (data.images) {
            updateData.images = {
                deleteMany: {},
                create: data.images.map(url => ({ url })),
            };
        }

        return await prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                images: true
            }
        });
    }

    async deleteProduct(id: number) {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new HttpException(404, "삭제할 상품이 없습니다.");

        await prisma.product.delete({ where: { id } });
    }

    async updateRoomType(roomId: number, data: UpdateRoomTypeInput) {
        const existingRoom = await prisma.roomType.findUnique({ where: { id: roomId } });
        if (!existingRoom) throw new HttpException(404, "존재하지 않는 객실입니다.");

        return await prisma.roomType.update({
            where: { id: roomId },
            data: {
                name: data.name,
                description: data.description,
                image: data.image,
                originPrice: data.originPrice,
                price: data.price,
            },
        });
    }

    async deleteRoomType(roomId: number) {
        const existingRoom = await prisma.roomType.findUnique({ where: { id: roomId } });
        if (!existingRoom) throw new HttpException(404, "존재하지 않는 객실입니다.");

        await prisma.roomType.delete({ where: { id: roomId } });
    }
}