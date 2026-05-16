import db from '../config/db';
import { Product as ProductType } from '../types';

class Product {
    static async findByNafdac(nafdacNumber: string): Promise<ProductType | undefined> {
        const query = 'SELECT * FROM products WHERE nafdac_number = $1';
        const { rows } = await db.query(query, [nafdacNumber]);
        return rows[0];
    }

    static async checkSafety(nafdacNumber: string): Promise<any> {
        const query = 'SELECT nafdac_number, is_registered, registration_status, has_safety_alert, alert_details FROM products WHERE nafdac_number = $1';
        const { rows } = await db.query(query, [nafdacNumber]);
        return rows[0];
    }

    static async getDetails(id: string | number): Promise<any> {
        const query = `
            SELECT p.*, 
                   (SELECT json_agg(pi.*) FROM pkg_images pi WHERE pi.product_id = p.id) as images,
                   (SELECT json_agg(fv.*) FROM fake_versions fv WHERE fv.product_id = p.id) as fake_versions,
                   (SELECT json_agg(pv.*) FROM product_variants pv WHERE pv.product_id = p.id) as variants
            FROM products p
            WHERE p.id = $1
        `;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async search(term: string): Promise<ProductType[]> {
        const query = `
            SELECT * FROM products 
            WHERE name ILIKE $1 OR nafdac_number ILIKE $1
            LIMIT 20
        `;
        const { rows } = await db.query(query, [`%${term}%`]);
        return rows;
    }
}

export default Product;
