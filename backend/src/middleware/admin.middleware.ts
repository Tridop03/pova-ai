import { Request, Response, NextFunction } from 'express';
import response from '../utils/apiResponse';

export interface AuthenticatedRequest extends Request {
    user?: any; // You can refine this with the User interface later
}

const verifyAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Assuming req.user is populated by auth middleware
    if (!req.user || req.user.role !== 'ADMIN') {
        return response.error(res, 'Access denied. Admin role required.', 403);
    }
    next();
};

export default verifyAdmin;
