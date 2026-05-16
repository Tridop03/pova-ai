import { Request, Response, NextFunction } from 'express';
import Variant from '../../models/variant.model';
import response from '../../utils/apiResponse';

class AdminVariantController {
    static async getByProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const { productId } = req.params;
            const variants = await Variant.getByProductId(productId);
            response.success(res, 'Variants fetched', variants);
        } catch (error) { next(error); }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const variant = await Variant.create(req.body);
            response.success(res, 'Variant created', variant, 201);
        } catch (error) { next(error); }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const variant = await Variant.update(id, req.body);
            if (!variant) return response.error(res, 'Variant not found', 404);
            response.success(res, 'Variant updated', variant);
        } catch (error) { next(error); }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await Variant.delete(id);
            response.success(res, 'Variant deleted');
        } catch (error) { next(error); }
    }
}

export default AdminVariantController;
