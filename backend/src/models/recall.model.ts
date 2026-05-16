import db from '../config/db';
import { Recall as RecallType } from '../types';

class Recall {
    static async findActive(): Promise<RecallType[]> {
        const query = 'SELECT * FROM recalled_products WHERE status = $1 ORDER BY recall_date DESC';
        const { rows } = await db.query(query, ['ACTIVE']);
        return rows;
    }

    static async findByProductId(productId: number): Promise<RecallType | undefined> {
        const query = 'SELECT * FROM recalled_products WHERE product_id = $1';
        const { rows } = await db.query(query, [productId]);
        return rows[0];
    }

    static async findByNafdac(nafdacNumber: string): Promise<RecallType | undefined> {
        const query = 'SELECT * FROM recalled_products WHERE nafdac_number = $1';
        const { rows } = await db.query(query, [nafdacNumber]);
        return rows[0];
    }

    static async create(data: any): Promise<RecallType> {
        const { product_id, nafdac_number, reason, severity, category, recall_date, affected_batches, added_by, notes } = data;
        const query = `
            INSERT INTO recalled_products (product_id, nafdac_number, reason, severity, category, recall_date, affected_batches, added_by, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const { rows } = await db.query(query, [product_id, nafdac_number, reason, severity, category, recall_date, JSON.stringify(affected_batches), added_by, notes]);
        return rows[0];
    }
}

export default Recall;
