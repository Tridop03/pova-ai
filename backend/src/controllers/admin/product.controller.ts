import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';
import response from '../../utils/apiResponse';
import UploadService from '../../services/upload.service';
import AuditService from '../../services/audit.service';

class AdminProductController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { search, category, status, is_registered } = req.query;
            let query = 'SELECT * FROM products WHERE 1=1';
            const params: any[] = [];

            if (search) {
                params.push(`%${search}%`);
                query += ` AND (name ILIKE $${params.length} OR nafdac_number ILIKE $${params.length} OR manufacturer ILIKE $${params.length})`;
            }
            if (category) {
                params.push(category);
                query += ` AND category = $${params.length}`;
            }
            if (status) {
                params.push(status);
                query += ` AND status = $${params.length}`;
            }
            if (is_registered !== undefined) {
                params.push(is_registered === 'true');
                query += ` AND is_registered = $${params.length}`;
            }

            query += ' ORDER BY created_at DESC';
            const result = await db.query(query, params);
            response.success(res, 'Products fetched', result.rows);
        } catch (error) { next(error); }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
            if (result.rows.length === 0) return response.error(res, 'Product not found', 404);
            response.success(res, 'Product fetched', result.rows[0]);
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const p = req.body;
            const adminId = (req as any).user?.id;
            const query = `
                INSERT INTO products (
                    name, category, nafdac_number, manufacturer, description, 
                    active_ingredients, product_form, route_of_administration, 
                    strength, applicant_name, country_of_origin, approval_date, 
                    expiry_date, presentation, is_registered, registration_status, 
                    has_safety_alert, alert_details, master_image_url
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                RETURNING *
            `;
            const values = [
                p.name, p.category, p.nafdac_number, p.manufacturer, p.description,
                p.active_ingredients, p.product_form, p.route_of_administration,
                p.strength, p.applicant_name, p.country_of_origin, p.approval_date,
                p.expiry_date, p.presentation, p.is_registered ?? true, p.registration_status ?? 'REGISTERED',
                p.has_safety_alert ?? false, p.alert_details, p.master_image_url
            ];
            const { rows } = await db.query(query, values);

            await AuditService.log({
                user_id: adminId,
                action: 'CREATE_PRODUCT',
                entity_type: 'products',
                entity_id: rows[0].id,
                new_data: rows[0],
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });

            response.success(res, 'Product created', rows[0], 201);
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const fields = Object.keys(req.body);
            if (fields.length === 0) return response.error(res, 'No fields to update', 400);

            const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
            const values = Object.values(req.body);
            const query = `UPDATE products SET ${setClause} WHERE id = $1 RETURNING *`;
            const { rows } = await db.query(query, [id, ...values]);
            
            if (rows.length === 0) return response.error(res, 'Product not found', 404);
            response.success(res, 'Product updated', rows[0]);
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await db.query('DELETE FROM products WHERE id = $1', [id]);
            response.success(res, 'Product deleted');
        } catch (error) { next(error); }
    }

    static async bulkUpload(req: Request, res: Response, next: NextFunction) {
        try {
            const multerReq = req as any; // Cast to access multer properties if not automatically picked up
            if (!multerReq.file) {
                return response.error(res, 'No file uploaded', 400);
            }

            const fileType = multerReq.file.originalname.split('.').pop() || '';
            const products = await UploadService.parseProducts(multerReq.file.path, fileType);
            
            await UploadService.insertBulk(products);

            response.success(res, `${products.length} products processed successfully`);
        } catch (error) { next(error); }
    }
}

export default AdminProductController;
