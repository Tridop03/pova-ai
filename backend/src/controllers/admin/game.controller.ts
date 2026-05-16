import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';
import response from '../../utils/apiResponse';

class AdminGameController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const query = `
                SELECT gr.*, p.name as product_name, fv.description as fake_desc
                FROM game_rounds gr
                LEFT JOIN products p ON gr.genuine_prod_id = p.id
                LEFT JOIN fake_versions fv ON gr.fake_version_id = fv.id
                ORDER BY gr.difficulty ASC
            `;
            const { rows } = await db.query(query);
            response.success(res, 'Game rounds fetched', rows);
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { genuine_prod_id, fake_version_id, correct_answer, explanation, difficulty } = req.body;
            const query = `
                INSERT INTO game_rounds (genuine_prod_id, fake_version_id, correct_answer, explanation, difficulty)
                VALUES ($1, $2, $3, $4, $5) RETURNING *
            `;
            const { rows } = await db.query(query, [genuine_prod_id, fake_version_id, correct_answer, explanation, difficulty]);
            response.success(res, 'Game round created', rows[0], 201);
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const fields = Object.keys(req.body);
            if (fields.length === 0) return response.error(res, 'No fields to update', 400);

            const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
            const values = Object.values(req.body);
            const query = `UPDATE game_rounds SET ${setClause} WHERE id = $1 RETURNING *`;
            const { rows } = await db.query(query, [id, ...values]);
            
            if (rows.length === 0) return response.error(res, 'Game round not found', 404);
            response.success(res, 'Game round updated', rows[0]);
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await db.query('DELETE FROM game_rounds WHERE id = $1', [id]);
            response.success(res, 'Game round deleted');
        } catch (error) { next(error); }
    }
}

export default AdminGameController;
