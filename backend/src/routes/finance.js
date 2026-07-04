import express from 'express';
import { getAllFinanceEntries, getFinanceEntryById, createFinanceEntry, updateFinanceEntry, deleteFinanceEntry, getProjectFinanceReport, getMonthlyReport } from '../controllers/financeController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllFinanceEntries);
router.get('/report/monthly', getMonthlyReport);
router.get('/report/project/:projectId', getProjectFinanceReport);
router.get('/:id', getFinanceEntryById);
router.post('/', authorizeRole('admin', 'financial'), createFinanceEntry);
router.put('/:id', authorizeRole('admin', 'financial'), updateFinanceEntry);
router.delete('/:id', authorizeRole('admin', 'financial'), deleteFinanceEntry);

export default router;
