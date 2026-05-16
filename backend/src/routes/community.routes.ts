import express, { Request, Response, NextFunction } from 'express';
import Comment from '../models/comment.model';
import Submission from '../models/submission.model';
import response from '../utils/apiResponse';

const router = express.Router();

// Comments
router.get('/comments/:productId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const comments = await Comment.findByProductId(req.params.productId);
        response.success(res, 'Comments fetched', comments);
    } catch (error) {
        next(error);
    }
});

router.post('/comments', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { product_id, content, user_id } = req.body;
        const comment = await Comment.create({ user_id, product_id, content });
        response.success(res, 'Comment posted', comment, 201);
    } catch (error) {
        next(error);
    }
});

// Submissions
router.post('/submissions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const submission = await Submission.create(req.body);
        response.success(res, 'Submission received', submission, 201);
    } catch (error) {
        next(error);
    }
});

export default router;
