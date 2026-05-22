import express, { Request, Response, NextFunction } from 'express';
import VerifyService from '../services/verify.service';
import response from '../utils/apiResponse';

const router = express.Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { images, product_id } = req.body;
        if (!images || !Array.isArray(images)) {
            const error: any = new Error('Images array is required');
            error.statusCode = 400;
            throw error;
        }

        const verificationResult = await VerifyService.verifyProduct(images, product_id);
        response.success(res, 'Verification complete', verificationResult);
    } catch (error) {
        next(error);
    }
});

export default router;
