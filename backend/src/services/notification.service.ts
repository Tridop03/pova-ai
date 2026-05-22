import db from '../config/db';

class NotificationService {
    async notifyUsersOfRecall(productId: string, nafdacNumber: string, reason: string) {
        console.log(`[NotificationService] Processing recall for product ${productId}...`);

        // 1. Find all users who have verified this NAFDAC number in the past
        // In a real app, we'd have a 'verifications' table tracking user-product links
        // For now, let's assume a hypothetical query or a placeholder for future implementation
        
        const query = `
            SELECT DISTINCT u.email, u.id 
            FROM users u
            JOIN submissions s ON s.submitted_by = u.id
            WHERE s.nafdac_number = $1
        `;
        
        try {
            const { rows: affectedUsers } = await db.query(query, [nafdacNumber]);

            for (const user of affectedUsers) {
                await this.sendAlert(user.id, {
                    title: '🚨 Product Recall Alert!',
                    message: `A product you previously checked (NAFDAC: ${nafdacNumber}) has been recalled. Reason: ${reason}. Please stop use immediately.`,
                    type: 'RECALL'
                });
            }

            return { notifiedCount: affectedUsers.length };
        } catch (error) {
            console.error('[NotificationService] Error sending recall alerts:', error);
            throw error;
        }
    }

    private async sendAlert(userId: string, payload: { title: string, message: string, type: string }) {
        // Here we would integrate with Firebase Cloud Messaging (FCM) or an Email service (SendGrid/AWS SES)
        console.log(`[ALERT to User ${userId}]: ${payload.title} - ${payload.message}`);
        
        // Optionally log the alert to a database 'notifications' table
        const query = 'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)';
        // await db.query(query, [userId, payload.title, payload.message, payload.type]);
    }
}

export default new NotificationService();
