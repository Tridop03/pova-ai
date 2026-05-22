import db from '../config/db';

class AdminService {
    static async getSystemStats(): Promise<any> {
        const usersCount = await db.query('SELECT COUNT(*) FROM users');
        const productsCount = await db.query('SELECT COUNT(*) FROM products');
        const fakesCount = await db.query("SELECT COUNT(*) FROM products WHERE status = 'FAKES_CIRC'");
        const submissionsCount = await db.query("SELECT COUNT(*) FROM submissions WHERE status = 'PENDING'");
        
        return {
            totalUsers: parseInt((usersCount.rows[0] as any).count),
            totalProducts: parseInt((productsCount.rows[0] as any).count),
            circulatingFakes: parseInt((fakesCount.rows[0] as any).count),
            pendingSubmissions: parseInt((submissionsCount.rows[0] as any).count),
        };
    }

    static async getAllUsers(): Promise<any[]> {
        const query = 'SELECT id, username, email, role, is_banned FROM users';
        const { rows } = await db.query(query);
        return rows;
    }

    static async getPendingSubmissions(): Promise<any[]> {
        const query = "SELECT * FROM submissions WHERE status = 'PENDING' ORDER BY created_at DESC";
        const { rows } = await db.query(query);
        return rows;
    }
}

export default AdminService;
