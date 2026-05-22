import express from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import verifyRoutes from './verify.routes';
import recallRoutes from './recall.routes';
import communityRoutes from './community.routes';
import gameRoutes from './game.routes';
import leaderboardRoutes from './leaderboard.routes';
import adminRoutes from './admin/admin.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/verify', verifyRoutes);
router.use('/recalls', recallRoutes);
router.use('/community', communityRoutes);
router.use('/game', gameRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/admin', adminRoutes);

export default router;
