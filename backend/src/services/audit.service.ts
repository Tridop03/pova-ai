import db from '../config/db';

class AuditService {
    static async log(data: {
        user_id: string;
        action: string;
        entity_type?: string;
        entity_id?: string;
        old_data?: any;
        new_data?: any;
        ip_address?: string;
        user_agent?: string;
    }) {
        try {
            const query = `
                INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, ip_address, user_agent)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            const values = [
                data.user_id,
                data.action,
                data.entity_type,
                data.entity_id,
                data.old_data ? JSON.stringify(data.old_data) : null,
                data.new_data ? JSON.stringify(data.new_data) : null,
                data.ip_address,
                data.user_agent
            ];
            await db.query(query, values);
        } catch (error) {
            console.error('Failed to write audit log:', error);
            // Don't throw error to avoid breaking the main request
        }
    }
}

export default AuditService;
