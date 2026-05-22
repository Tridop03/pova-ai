import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';
import response from '../../utils/apiResponse';
import AuditService from '../../services/audit.service';

class AdminUserController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await db.query('SELECT id, username, email, role, is_banned, created_at FROM users ORDER BY created_at DESC');
            response.success(res, 'Users fetched', users.rows);
        } catch (error) { next(error); }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { rows } = await db.query('SELECT id, username, email, role, is_banned, created_at FROM users WHERE id = $1', [id]);
            if (rows.length === 0) return response.error(res, 'User not found', 404);
            response.success(res, 'User fetched', rows[0]);
        } catch (error) { next(error); }
    }

    static async ban(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { is_banned } = req.body;
            const adminId = (req as any).user?.id;

            const { rows } = await db.query('UPDATE users SET is_banned = $1 WHERE id = $2 RETURNING *', [is_banned, id]);
            if (rows.length === 0) return response.error(res, 'User not found', 404);

            await AuditService.log({
                user_id: adminId,
                action: is_banned ? 'BAN_USER' : 'UNBAN_USER',
                entity_type: 'users',
                entity_id: id,
                new_data: rows[0],
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });

            response.success(res, is_banned ? 'User banned' : 'User unbanned', rows[0]);
        } catch (error) { next(error); }
    }

    static async updateRole(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            const adminId = (req as any).user?.id;

            const { rows } = await db.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING *', [role, id]);
            if (rows.length === 0) return response.error(res, 'User not found', 404);

            await AuditService.log({
                user_id: adminId,
                action: 'UPDATE_USER_ROLE',
                entity_type: 'users',
                entity_id: id,
                new_data: rows[0],
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });

            response.success(res, 'User role updated', rows[0]);
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await db.query('DELETE FROM users WHERE id = $1', [id]);
            response.success(res, 'User deleted');
        } catch (error) { next(error); }
    }
}

export default AdminUserController;
