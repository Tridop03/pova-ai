import { Request, Response, NextFunction } from 'express';
import BatchModel from '../../models/batch.model';
import response from '../../utils/apiResponse';

class BatchController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const batch = await BatchModel.create(req.body);
            response.success(res, 'Batch created', batch, 201);
        } catch (error) {
            next(error);
        }
    }

    async getByProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const batches = await BatchModel.findByProduct(req.params.productId);
            response.success(res, 'Batches fetched', batches);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const batch = await BatchModel.update(req.params.id, req.body);
            if (!batch) {
                response.error(res, 'Batch not found', 404);
                return;
            }
            response.success(res, 'Batch updated', batch);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const deleted = await BatchModel.delete(req.params.id);
            if (!deleted) {
                response.error(res, 'Batch not found', 404);
                return;
            }
            response.success(res, 'Batch deleted');
        } catch (error) {
            next(error);
        }
    }
}

export default new BatchController();
