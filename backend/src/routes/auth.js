import express from 'express';
import { register, login, validateToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/validate-token', validateToken);

export default router;
