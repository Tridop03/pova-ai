import db from '../config/db';

class GameRound {
    static async getRandom(difficulty: string = 'MEDIUM'): Promise<any> {
        const query = `
            SELECT gr.*, 
                   p.name as genuine_name, p.nafdac_number as genuine_nafdac,
                   fv.differences as fake_details
            FROM game_rounds gr
            JOIN products p ON gr.genuine_prod_id = p.id
            JOIN fake_versions fv ON gr.fake_version_id = fv.id
            WHERE gr.difficulty = $1
            ORDER BY RANDOM()
            LIMIT 1
        `;
        const { rows } = await db.query(query, [difficulty]);
        return rows[0];
    }

    static async findById(id: number | string): Promise<any> {
        const query = 'SELECT * FROM game_rounds WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
}

export default GameRound;
