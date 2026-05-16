import db from '../config/db';

class UserScore {
    static async findByUserId(userId: number | string): Promise<any> {
        const query = 'SELECT * FROM user_scores WHERE user_id = $1';
        const { rows } = await db.query(query, [userId]);
        return rows[0];
    }

    static async upsertPoints(userId: number | string, points: number): Promise<any> {
        const query = `
            INSERT INTO user_scores (user_id, total_points)
            VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE 
            SET total_points = user_scores.total_points + $2, updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const { rows } = await db.query(query, [userId, points]);
        return rows[0];
    }

    static async getTopScores(limit: number = 10): Promise<any[]> {
        const query = `
            SELECT us.*, u.username 
            FROM user_scores us
            JOIN users u ON us.user_id = u.id
            ORDER BY us.total_points DESC
            LIMIT $1
        `;
        const { rows } = await db.query(query, [limit]);
        return rows;
    }

    static async updateRankings(): Promise<any> {
        const query = `
            WITH RankedUsers AS (
                SELECT id, RANK() OVER (ORDER BY total_points DESC) as current_rank
                FROM user_scores
            )
            UPDATE user_scores us
            SET rank = ru.current_rank
            FROM RankedUsers ru
            WHERE us.id = ru.id
        `;
        return await db.query(query);
    }
}

export default UserScore;
