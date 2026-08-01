import express from 'express';
import { register, login, validateToken, getSetupStatus, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/setup-status', getSetupStatus);
router.post('/register', register);
router.post('/login', login);
router.post('/change-password', authenticateToken, changePassword);
router.post('/validate-token', validateToken);

export default router;
