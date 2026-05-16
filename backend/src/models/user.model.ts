import db from '../config/db';
import { User as UserType, UserRole } from '../types';

class User {
    static async create({ username, email, passwordHash, role = 'USER' }: { username: string, email: string, passwordHash: string, role?: UserRole }): Promise<UserType> {
        const query = `
            INSERT INTO users (username, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role, created_at
        `;
        const { rows } = await db.query(query, [username, email, passwordHash, role]);
        return rows[0];
    }

    static async findByEmail(email: string): Promise<UserType | undefined> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        return rows[0];
    }

    static async findById(id: number): Promise<UserType | undefined> {
        const query = 'SELECT id, username, email, role, is_banned, created_at FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async updateRole(id: number, role: UserRole): Promise<Partial<UserType>> {
        const query = 'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role';
        const { rows } = await db.query(query, [role, id]);
        return rows[0];
    }

    static async setBanStatus(id: number, status: boolean): Promise<Partial<UserType>> {
        const query = 'UPDATE users SET is_banned = $1 WHERE id = $2 RETURNING id, username, is_banned';
        const { rows } = await db.query(query, [status, id]);
        return rows[0];
    }
}

export default User;
