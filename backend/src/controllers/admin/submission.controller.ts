import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';
import response from '../../utils/apiResponse';

class AdminSubmissionController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const submissions = await db.query('SELECT * FROM submissions ORDER BY created_at DESC');
            response.success(res, 'Submissions fetched', submissions.rows);
        } catch (error) { next(error); }
    }

    static async review(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status, review_notes, reviewed_by } = req.body;
            const query = `UPDATE submissions SET status = $1, review_notes = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`;
            const { rows } = await db.query(query, [status, review_notes, reviewed_by, id]);
            if (rows.length === 0) return response.error(res, 'Submission not found', 404);
            response.success(res, 'Submission reviewed', rows[0]);
        } catch (error) { next(error); }
    }

    static async promoteToMaster(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params; // submission id
            const { productId, imageUrl } = req.body;

            // 1. Update the master_image_url for the product
            await db.query('UPDATE products SET master_image_url = $1 WHERE id = $2', [imageUrl, productId]);

            // 2. Add to pkg_images as a verified 'front' image
            await db.query('INSERT INTO pkg_images (product_id, image_url, image_type) VALUES ($1, $2, $3)', [productId, imageUrl, 'front']);

            response.success(res, 'Submission image promoted to master product image');
        } catch (error) { next(error); }
    }
}

export default AdminSubmissionController;
