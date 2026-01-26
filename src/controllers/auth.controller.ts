import { Request, Response, NextFunction } from 'express';
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            // validateBody 미들웨어를 통과했으므로 req.body는 안전합니다.
            // Zod의 .refine을 통해 비밀번호 일치 여부도 이미 검증되었습니다.
            const user = await authService.register(req.body);

            res.status(201).json({
                message: '회원가입에 성공했습니다.',
                data: user,
            });
        } catch (error: any) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;
            const result = await authService.login({ username, password });

            res.status(200).json({
                message: '로그인 성공',
                data: result,
            });
        } catch (error: any) {
            next(error);
        }
    }
}