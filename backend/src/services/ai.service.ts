import axios, { AxiosInstance } from 'axios';
import env from '../config/env';

class AIService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: env.aiServiceUrl,
            timeout: 30000,
        });
    }

    async analyzeImages(images: string[], productId: string | number | null = null): Promise<any> {
        try {
            // images should be an array of base64 strings
            const response = await this.client.post('/api/analyze', {
                images,
                product_id: productId,
            });
            return response.data;
        } catch (error: any) {
            console.error('AI Service Error:', error.response?.data || error.message);
            throw new Error('Failed to analyze images via AI service');
        }
    }
}

export default new AIService();
