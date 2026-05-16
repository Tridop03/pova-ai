import express, { Request, Response, NextFunction } from 'express';
import GameRound from '../models/gameRound.model';
import UserScore from '../models/userScore.model';
import response from '../utils/apiResponse';

const router = express.Router();

router.get('/round', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { difficulty } = req.query as { difficulty: string };
        const round = await GameRound.getRandom(difficulty);
        if (!round) {
            response.error(res, 'No game rounds available', 404);
            return;
        }
        response.success(res, 'Game round fetched', round);
    } catch (error) {
        next(error);
    }
});

router.post('/answer', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, roundId, answer } = req.body;
        const round = await GameRound.findById(roundId);
        
        if (!round) {
            response.error(res, 'Round not found', 404);
            return;
        }

        const isCorrect = round.correct_answer === answer;
        const points = isCorrect ? 10 : 0; // Fixed points for now

        let userScore = null;
        if (userId) {
            userScore = await UserScore.upsertPoints(userId, points);
        }

        response.success(res, 'Answer submitted', {
            isCorrect,
            points,
            explanation: round.explanation,
            userScore
        });
    } catch (error) {
        next(error);
    }
});

export default router;
