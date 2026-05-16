import express from 'express';
import ProductController from '../controllers/product.controller';

const router = express.Router();

router.get('/search', ProductController.search);
router.get('/:id', ProductController.getById);

export default router;
