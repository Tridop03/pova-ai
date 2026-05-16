import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import response from '../utils/apiResponse';
import { AuthenticatedRequest } from './admin.middleware';

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.error(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, env.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        return response.error(res, 'Invalid or expired token', 401);
    }
};

export default {
    verifyToken,
};
