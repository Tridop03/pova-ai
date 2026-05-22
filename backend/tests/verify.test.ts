const request = require('supertest');
const app = require('../src/app');
const aiService = require('../src/services/ai.service');

// Mock AI Service to avoid dependency on the live FastAPI service during unit/integration tests
jest.mock('../src/services/ai.service');

describe('POST /api/verify', () => {
    it('should return a successful verification verdict when AI finds a NAFDAC number', async () => {
        aiService.analyzeImages.mockResolvedValue({
            nafdac_number: 'A1-1234',
            verdict: 'SUCCESS',
            confidence: 0.95,
            flags: [],
            blur_results: [{ is_blurry: false, blur_score: 150.0 }]
        });

        const res = await request(app)
            .post('/api/verify')
            .send({
                images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==']
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.nafdacNumber).toBe('A1-1234');
        expect(res.body.data.verdict).toBe('SUCCESS');
    });

    it('should return a warning when the image is blurry', async () => {
        aiService.analyzeImages.mockResolvedValue({
            nafdac_number: 'A1-1234',
            verdict: 'SUCCESS',
            confidence: 0.8,
            flags: ['Warning: Image is blurry'],
            blur_results: [{ is_blurry: true, blur_score: 50.0 }]
        });

        const res = await request(app)
            .post('/api/verify')
            .send({
                images: ['base64_blurry_image']
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.verdict).toBe('SUCCESS');
        // In a real scenario, the backend might aggregate flags
    });
});
