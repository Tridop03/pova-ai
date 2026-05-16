import db from '../config/db';
import { ProductBatch } from '../types';

class BatchModel {
    async create(batch: Omit<ProductBatch, 'id' | 'created_at'>): Promise<ProductBatch> {
        const query = `
            INSERT INTO product_batches (product_id, batch_number, expiry_date)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const { rows } = await db.query(query, [batch.product_id, batch.batch_number, batch.expiry_date]);
        return rows[0];
    }

    async findByProduct(productId: string | number): Promise<ProductBatch[]> {
        const query = 'SELECT * FROM product_batches WHERE product_id = $1 ORDER BY expiry_date DESC';
        const { rows } = await db.query(query, [productId]);
        return rows;
    }

    async findByBatchNumber(productId: string | number, batchNumber: string): Promise<ProductBatch | null> {
        const query = 'SELECT * FROM product_batches WHERE product_id = $1 AND batch_number = $2';
        const { rows } = await db.query(query, [productId, batchNumber]);
        return rows[0] || null;
    }

    async update(id: string, updates: Partial<Omit<ProductBatch, 'id' | 'created_at'>>): Promise<ProductBatch | null> {
        const fields = Object.keys(updates);
        if (fields.length === 0) return null;

        const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
        const values = Object.values(updates);

        const query = `
            UPDATE product_batches
            SET ${setClause}
            WHERE id = $1
            RETURNING *
        `;
        const { rows } = await db.query(query, [id, ...values]);
        return rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const query = 'DELETE FROM product_batches WHERE id = $1';
        const result = await db.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}

export default new BatchModel();
