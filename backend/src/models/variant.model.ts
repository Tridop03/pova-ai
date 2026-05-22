import db from '../config/db';

export interface ProductVariant {
    id: number;
    product_id: number;
    variant_name: string;
    flavor?: string;
    packaging_type?: string;
    size_weight?: string;
    master_image_url?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

class Variant {
    static async getByProductId(productId: number | string): Promise<ProductVariant[]> {
        const { rows } = await db.query('SELECT * FROM product_variants WHERE product_id = $1 AND is_active = TRUE', [productId]);
        return rows;
    }

    static async getById(id: number | string): Promise<ProductVariant | undefined> {
        const { rows } = await db.query('SELECT * FROM product_variants WHERE id = $1', [id]);
        return rows[0];
    }

    static async create(data: Partial<ProductVariant>): Promise<ProductVariant> {
        const { product_id, variant_name, flavor, packaging_type, size_weight, master_image_url } = data;
        const query = `
            INSERT INTO product_variants (product_id, variant_name, flavor, packaging_type, size_weight, master_image_url)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const { rows } = await db.query(query, [product_id, variant_name, flavor, packaging_type, size_weight, master_image_url]);
        return rows[0];
    }

    static async update(id: number | string, data: Partial<ProductVariant>): Promise<ProductVariant | undefined> {
        const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at');
        if (fields.length === 0) return this.getById(id);

        const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
        const values = Object.values(data);
        const query = `UPDATE product_variants SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
        const { rows } = await db.query(query, [id, ...values]);
        return rows[0];
    }

    static async delete(id: number | string): Promise<void> {
        await db.query('DELETE FROM product_variants WHERE id = $1', [id]);
    }
}

export default Variant;
