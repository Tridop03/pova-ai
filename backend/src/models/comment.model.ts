import db from '../config/db';
import { Comment as CommentType } from '../types';

class Comment {
    static async create({ user_id, product_id, content }: { user_id: number, product_id: number, content: string }): Promise<CommentType> {
        const query = `
            INSERT INTO comments (user_id, product_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const { rows } = await db.query(query, [user_id, product_id, content]);
        return rows[0];
    }

    static async findByProductId(productId: string | number): Promise<any[]> {
        const query = `
            SELECT c.*, u.username 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.product_id = $1 AND c.flagged = FALSE
            ORDER BY c.created_at DESC
        `;
        const { rows } = await db.query(query, [productId]);
        return rows;
    }

    static async flag(id: number): Promise<CommentType> {
        const query = 'UPDATE comments SET flagged = TRUE WHERE id = $1 RETURNING *';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
}

export default Comment;
