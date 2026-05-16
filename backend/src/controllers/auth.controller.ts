import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import AuditService from '../services/audit.service';
import response from '../utils/apiResponse';

class AuthController {
    static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await AuthService.register(req.body);
            response.success(res, 'User registered successfully', user, 201);
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                const error: any = new Error('Email and password are required');
                error.statusCode = 400;
                throw error;
            }
            const data = await AuthService.login(email, password);
            
            // Log security event
            await AuditService.log({
                user_id: data.user.id!,
                action: 'LOGIN_SUCCESS',
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });

            response.success(res, 'Login successful', data);
        } catch (error: any) {
            // Log failed login attempt
            if (error.statusCode === 401) {
                // We'd need the email here, but for now we log the event
                console.log(`Failed login attempt for ${req.body.email}`);
            }
            next(error);
        }
    }

    static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken, userId } = req.body;
            const data = await AuthService.refreshToken(userId, refreshToken);
            response.success(res, 'Token refreshed', data);
        } catch (error) { next(error); }
    }

    static async setupMFA(req: any, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            const mfaData = await AuthService.generateMFASecret(userId);
            response.success(res, 'MFA Setup initialized', mfaData);
        } catch (error) { next(error); }
    }

    static async verifyMFA(req: any, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            const { code } = req.body;
            const isValid = await AuthService.verifyMFA(userId, code);
            if (!isValid) return response.error(res, 'Invalid MFA code', 400);
            response.success(res, 'MFA enabled successfully');
        } catch (error) { next(error); }
    }

    static async googleCallback(req: any, res: Response, next: NextFunction): Promise<void> {
        try {
            // req.user is populated by passport
            const user = req.user;
            const token = AuthService.generateToken(user);
            response.success(res, 'Google login successful', { user, token });
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController;
