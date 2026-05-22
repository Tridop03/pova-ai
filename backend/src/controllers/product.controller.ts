import { Request, Response, NextFunction } from 'express';
import Product from '../models/product.model';
import response from '../utils/apiResponse';

class ProductController {
    static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { q } = req.query as { q: string };
            if (!q) {
                response.error(res, 'Search query is required', 400);
                return;
            }
            const products = await Product.search(q);
            response.success(res, 'Products found', products);
        } catch (error) { 
            next(error); 
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const product = await Product.getDetails(req.params.id);
            if (!product) {
                response.error(res, 'Product not found', 404);
                return;
            }
            response.success(res, 'Product details', product);
        } catch (error) { 
            next(error); 
        }
    }
}

export default ProductController;
