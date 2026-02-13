import { Request, Response, NextFunction } from 'express';
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const result = await userService.updateProfile(userId, req.body);

            res.status(200).json({
                message: '회원 정보가 수정되었습니다.',
                data: result,
            });
        } catch (error: any) {
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            await userService.changePassword(userId, req.body);

            res.status(200).json({
                message: "비밀번호가 성공적으로 변경되었습니다.",
            });
        } catch (error: any) {
            next(error);
        }
    }
}