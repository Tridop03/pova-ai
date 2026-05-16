import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';
import response from '../../utils/apiResponse';

class AdminFakeVersionController {
    static async getByProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const { productId } = req.params;
            const { rows } = await db.query('SELECT * FROM fake_versions WHERE product_id = $1 ORDER BY reported_at DESC', [productId]);
            response.success(res, 'Fake versions fetched', rows);
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { product_id, description, differences } = req.body;
            const query = `
                INSERT INTO fake_versions (product_id, description, differences)
                VALUES ($1, $2, $3) RETURNING *
            `;
            const { rows } = await db.query(query, [product_id, description, JSON.stringify(differences)]);
            response.success(res, 'Fake version added', rows[0], 201);
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const fields = Object.keys(req.body);
            if (fields.length === 0) return response.error(res, 'No fields to update', 400);

            const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
            const values = Object.values(req.body);
            const query = `UPDATE fake_versions SET ${setClause} WHERE id = $1 RETURNING *`;
            const { rows } = await db.query(query, [id, ...values]);
            
            if (rows.length === 0) return response.error(res, 'Fake version not found', 404);
            response.success(res, 'Fake version updated', rows[0]);
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await db.query('DELETE FROM fake_versions WHERE id = $1', [id]);
            response.success(res, 'Fake version deleted');
        } catch (error) { next(error); }
    }
}

export default AdminFakeVersionController;
