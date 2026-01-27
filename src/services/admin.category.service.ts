import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { deleteFileFromFirebase, uploadFileToFirebase } from "../utils/upload.utils";
import { CreateCategoryInput, CreateSubCategoryInput } from "../schemas/admin.category.schema";

export class AdminCategoryService {
    async createCategory(data: CreateCategoryInput, file?: Express.Multer.File) {
        const exists = await prisma.category.findUnique({ where: { path: data.path } });
        if (exists) {
            throw new HttpException(409, "이미 존재하는 Path입니다.");
        }

        if (!file) {
            throw new HttpException(400, "이미지 파일을 업로드해주세요.");
        }

        const imageUrl = await uploadFileToFirebase(file, "categories");

        return await prisma.category.create({
            data: {
                name: data.name,
                path: data.path,
                image: imageUrl,
            },
        });
    }

    async createSubCategory(data: CreateSubCategoryInput) {
        const parent = await prisma.category.findUnique({ where: { id: data.categoryId } });
        if (!parent) {
            throw new HttpException(404, "부모 카테고리가 존재하지 않습니다.");
        }

        return await prisma.subCategory.create({
            data: {
                name: data.name,
                categoryId: data.categoryId,
            },
        });
    }

    async deleteCategory(id: number) {
        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) throw new HttpException(404, "카테고리가 없습니다.");

        if (category.image) {
            await deleteFileFromFirebase(category.image);
        }

        await prisma.category.delete({ where: { id } });
    }

    async deleteSubCategory(id: number) {
        const subCategory = await prisma.subCategory.findUnique({ where: { id } });
        if (!subCategory) throw new HttpException(404, "2차 카테고리가 없습니다.");

        await prisma.subCategory.delete({ where: { id } });
    }
}
