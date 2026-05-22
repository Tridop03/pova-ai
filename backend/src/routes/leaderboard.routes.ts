import express, { Request, Response, NextFunction } from 'express';
import UserScore from '../models/userScore.model';
import response from '../utils/apiResponse';

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit } = req.query as { limit?: string };
        const topScores = await UserScore.getTopScores(limit ? parseInt(limit) : 10);
        response.success(res, 'Top scores fetched', topScores);
    } catch (error) {
        next(error);
    }
});

export default router;
