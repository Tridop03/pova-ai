import { Request, Response, NextFunction } from 'express';
import AdminService from '../../services/admin.service';
import response from '../../utils/apiResponse';

class DashboardController {
    static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await AdminService.getSystemStats();
            response.success(res, 'Dashboard stats fetched', stats);
        } catch (error) {
            next(error);
        }
    }
}

export default DashboardController;
