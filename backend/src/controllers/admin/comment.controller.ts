import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';
import response from '../../utils/apiResponse';

class AdminCommentController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const query = `
                SELECT c.*, u.username, p.name as product_name 
                FROM comments c
                JOIN users u ON c.user_id = u.id
                JOIN products p ON c.product_id = p.id
                ORDER BY c.created_at DESC
            `;
            const { rows } = await db.query(query);
            response.success(res, 'Comments fetched', rows);
        } catch (error) { next(error); }
    }

    static async toggleFlag(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { flagged } = req.body;
            const { rows } = await db.query('UPDATE comments SET flagged = $1 WHERE id = $2 RETURNING *', [flagged, id]);
            if (rows.length === 0) return response.error(res, 'Comment not found', 404);
            response.success(res, flagged ? 'Comment flagged' : 'Comment unflagged', rows[0]);
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await db.query('DELETE FROM comments WHERE id = $1', [id]);
            response.success(res, 'Comment deleted');
        } catch (error) { next(error); }
    }
}

export default AdminCommentController;
