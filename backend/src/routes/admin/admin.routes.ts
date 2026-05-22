import express from 'express';
import DashboardController from '../../controllers/admin/dashboard.controller';
import managementRoutes from './management.routes';

const router = express.Router();

// router.use(verifyAdmin); // Apply to all admin routes

router.use('/manage', managementRoutes);
router.get('/stats', DashboardController.getStats);

export default router;
