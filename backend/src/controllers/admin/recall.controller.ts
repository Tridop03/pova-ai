import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';
import response from '../../utils/apiResponse';
import NotificationService from '../../services/notification.service';

class AdminRecallController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const recalls = await db.query('SELECT * FROM recalled_products ORDER BY recall_date DESC');
            response.success(res, 'Recalls fetched', recalls.rows);
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { product_id, nafdac_number, reason, severity, category, recall_date, status, affected_batches, added_by, notes } = req.body;
            const query = `
                INSERT INTO recalled_products (product_id, nafdac_number, reason, severity, category, recall_date, status, affected_batches, added_by, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
            `;
            const { rows } = await db.query(query, [product_id, nafdac_number, reason, severity, category, recall_date, status, JSON.stringify(affected_batches), added_by, notes]);
            
            // Trigger notifications asynchronously
            NotificationService.notifyUsersOfRecall(product_id, nafdac_number, reason).catch(err => {
                console.error('Failed to send recall notifications:', err);
            });

            response.success(res, 'Recall created and users notified', rows[0], 201);
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const fields = Object.keys(req.body);
            if (fields.length === 0) return response.error(res, 'No fields to update', 400);

            const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
            const values = Object.values(req.body);
            const query = `UPDATE recalled_products SET ${setClause} WHERE id = $1 RETURNING *`;
            const { rows } = await db.query(query, [id, ...values]);
            
            if (rows.length === 0) return response.error(res, 'Recall not found', 404);
            response.success(res, 'Recall updated', rows[0]);
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await db.query('DELETE FROM recalled_products WHERE id = $1', [id]);
            response.success(res, 'Recall deleted');
        } catch (error) { next(error); }
    }
}

export default AdminRecallController;
