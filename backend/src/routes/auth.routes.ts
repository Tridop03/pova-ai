import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import AuthController from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);

// MFA Endpoints (Requires authentication)
router.get('/mfa/setup', passport.authenticate('jwt', { session: false }), AuthController.setupMFA);
router.post('/mfa/verify', passport.authenticate('jwt', { session: false }), AuthController.verifyMFA);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), AuthController.googleCallback);

export default router;
