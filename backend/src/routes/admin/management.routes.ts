import express from 'express';
import BatchController from '../../controllers/admin/batch.controller';
import AdminProductController from '../../controllers/admin/product.controller';
import AdminUserController from '../../controllers/admin/user.controller';
import AdminSubmissionController from '../../controllers/admin/submission.controller';
import AdminRecallController from '../../controllers/admin/recall.controller';
import AdminFakeVersionController from '../../controllers/admin/fake_version.controller';
import AdminVariantController from '../../controllers/admin/variant.controller';
import AdminCommentController from '../../controllers/admin/comment.controller';
import AdminGameController from '../../controllers/admin/game.controller';
import { upload } from '../../middleware/upload.middleware';
import { adminLimiter, validate, productSchema, banUserSchema, updateRoleSchema, recallSchema } from '../../middleware/validation.middleware';

const router = express.Router();

// Apply global admin rate limit
router.use(adminLimiter);

// Product Management
router.get('/products', AdminProductController.getAll);
router.get('/products/:id', AdminProductController.getById);
router.post('/products', validate(productSchema), AdminProductController.create);
router.put('/products/:id', validate(productSchema), AdminProductController.update);
router.delete('/products/:id', AdminProductController.delete);
router.post('/products/bulk', upload.single('file'), AdminProductController.bulkUpload);

// Batch Management
router.get('/products/:productId/batches', BatchController.getByProduct);
router.post('/batches', BatchController.create);
router.put('/batches/:id', BatchController.update);
router.delete('/batches/:id', BatchController.delete);

// Fake Version Management
router.get('/products/:productId/fake-versions', AdminFakeVersionController.getByProduct);
router.post('/fake-versions', AdminFakeVersionController.create);
router.put('/fake-versions/:id', AdminFakeVersionController.update);
router.delete('/fake-versions/:id', AdminFakeVersionController.delete);

// Variant Management (Flavors, Packaging)
router.get('/products/:productId/variants', AdminVariantController.getByProduct);
router.post('/variants', AdminVariantController.create);
router.put('/variants/:id', AdminVariantController.update);
router.delete('/variants/:id', AdminVariantController.delete);

// User Management
router.get('/users', AdminUserController.getAll);
router.get('/users/:id', AdminUserController.getById);
router.put('/users/:id/ban', validate(banUserSchema), AdminUserController.ban);
router.put('/users/:id/role', validate(updateRoleSchema), AdminUserController.updateRole);
router.delete('/users/:id', AdminUserController.delete);

// Submissions Review
router.get('/submissions', AdminSubmissionController.getAll);
router.put('/submissions/:id', AdminSubmissionController.review);
router.post('/submissions/:id/promote', AdminSubmissionController.promoteToMaster);

// Recall Management
router.get('/recalls', AdminRecallController.getAll);
router.post('/recalls', validate(recallSchema), AdminRecallController.create);
router.put('/recalls/:id', validate(recallSchema), AdminRecallController.update);
router.delete('/recalls/:id', AdminRecallController.delete);

// Community/Comment Management
router.get('/comments', AdminCommentController.getAll);
router.put('/comments/:id/flag', AdminCommentController.toggleFlag);
router.delete('/comments/:id', AdminCommentController.delete);

// Game Management
router.get('/game/rounds', AdminGameController.getAll);
router.post('/game/rounds', AdminGameController.create);
router.put('/game/rounds/:id', AdminGameController.update);
router.delete('/game/rounds/:id', AdminGameController.delete);

export default router;
