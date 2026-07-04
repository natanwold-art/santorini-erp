import express from 'express';
import { getAllBudgets, getBudgetById, createBudget, updateBudget, deleteBudget, getBudgetsByStatus } from '../controllers/budgetController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllBudgets);
router.get('/status/:status', getBudgetsByStatus);
router.get('/:id', getBudgetById);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
