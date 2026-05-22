import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import db from '../config/db';
import User from '../models/user.model';
import env from '../config/env';
import { User as UserType } from '../types';

class AuthService {
    static async register({ username, email, password }: any): Promise<UserType> {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            const error: any = new Error('User with this email already exists');
            error.statusCode = 400;
            throw error;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        return await User.create({ username, email, passwordHash });
    }

    static async login(email: string, password: string): Promise<{ user: Partial<UserType>, token: string, refreshToken: string, mfaRequired: boolean }> {
        const user = await User.findByEmail(email);
        if (!user) {
            const error: any = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        if (user.is_banned) {
            const error: any = new Error('Account banned. Please contact support.');
            error.statusCode = 403;
            throw error;
        }

        // Check Account Lockout
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const error: any = new Error(`Account is locked until ${user.locked_until}. Too many failed attempts.`);
            error.statusCode = 423;
            throw error;
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            // Track failed attempts
            const attempts = (user.failed_login_attempts || 0) + 1;
            let lockedUntil = null;
            if (attempts >= 5) {
                lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
            }
            await db.query('UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3', [attempts, lockedUntil, user.id]);
            
            const error: any = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Reset failed attempts on success
        await db.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

        const mfaRequired = !!user.mfa_enabled;
        const token = this.generateToken(user);
        const refreshToken = this.generateRefreshToken(user);

        // Store refresh token in DB
        await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

        return {
            user: { id: user.id, username: user.username, email: user.email, role: user.role },
            token,
            refreshToken,
            mfaRequired
        };
    }

    static generateToken(user: any): string {
        return jwt.sign(
            { id: user.id, username: user.username, role: user.role, version: user.token_version },
            env.jwt.secret,
            { expiresIn: '1h' } // Short-lived
        );
    }

    static generateRefreshToken(user: any): string {
        return jwt.sign(
            { id: user.id, version: user.token_version },
            env.jwt.secret + '_refresh',
            { expiresIn: '7d' } // Long-lived
        );
    }

    static async generateMFASecret(userId: string): Promise<{ otpauth_url: string, base64Image: string, secret: string }> {
        const secret = speakeasy.generateSecret({
            name: `POVA:${userId}`,
        });

        const base64Image = await QRCode.toDataURL(secret.otpauth_url!);

        // Store secret temporarily in DB
        await db.query('UPDATE users SET mfa_secret = $1 WHERE id = $2', [secret.base32, userId]);

        return {
            otpauth_url: secret.otpauth_url!,
            base64Image,
            secret: secret.base32
        };
    }

    static async verifyMFA(userId: string, code: string): Promise<boolean> {
        const user = await User.findById(userId);
        if (!user || !user.mfa_secret) return false;

        const verified = speakeasy.totp.verify({
            secret: user.mfa_secret,
            encoding: 'base32',
            token: code
        });

        if (verified) {
            await db.query('UPDATE users SET mfa_enabled = TRUE WHERE id = $1', [userId]);
            return true;
        }
        return false;
    }

    static async refreshToken(userId: string, incomingToken: string): Promise<{ token: string, refreshToken: string }> {
        const user = await User.findById(userId);
        if (!user || user.refresh_token !== incomingToken) {
            const error: any = new Error('Invalid refresh token');
            error.statusCode = 401;
            throw error;
        }

        try {
            jwt.verify(incomingToken, env.jwt.secret + '_refresh');
        } catch (e) {
            const error: any = new Error('Expired or invalid refresh token');
            error.statusCode = 401;
            throw error;
        }

        const token = this.generateToken(user);
        const refreshToken = this.generateRefreshToken(user);

        await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

        return { token, refreshToken };
    }
}

export default AuthService;
