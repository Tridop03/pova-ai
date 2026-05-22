import express, { Request, Response, NextFunction } from 'express';
import Recall from '../models/recall.model';
import response from '../utils/apiResponse';

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recalls = await Recall.findActive();
        response.success(res, 'Active recalls fetched', recalls);
    } catch (error) {
        next(error);
    }
});

router.get('/check/:nafdac', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recall = await Recall.findByNafdac(req.params.nafdac);
        response.success(res, 'Recall check complete', { hasRecall: !!recall, recall });
    } catch (error) {
        next(error);
    }
});

export default router;
