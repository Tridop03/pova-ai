import db from '../config/db';

class Submission {
    static async create(data: any): Promise<any> {
        const { submitted_by, product_name, nafdac_number, image_urls, user_notes } = data;
        const query = `
            INSERT INTO submissions (submitted_by, product_name, nafdac_number, image_urls, user_notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const { rows } = await db.query(query, [submitted_by, product_name, nafdac_number, JSON.stringify(image_urls), user_notes]);
        return rows[0];
    }

    static async findByUserId(userId: number): Promise<any[]> {
        const query = 'SELECT * FROM submissions WHERE submitted_by = $1 ORDER BY created_at DESC';
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    static async updateStatus(id: number, { status, reviewed_by, review_notes }: { status: string, reviewed_by: number, review_notes: string }): Promise<any> {
        const query = `
            UPDATE submissions 
            SET status = $1, reviewed_by = $2, review_notes = $3, reviewed_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `;
        const { rows } = await db.query(query, [status, reviewed_by, review_notes, id]);
        return rows[0];
    }
}

export default Submission;
