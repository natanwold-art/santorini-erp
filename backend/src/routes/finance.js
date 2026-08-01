import express from 'express';
import { getAllFinanceEntries, getFinanceEntryById, createFinanceEntry, updateFinanceEntry, deleteFinanceEntry, getProjectFinanceReport, getMonthlyReport } from '../controllers/financeController.js';
import { authenticateToken, authorizePermission } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizePermission('finance'));

router.get('/', getAllFinanceEntries);
router.get('/report/monthly', getMonthlyReport);
router.get('/report/project/:projectId', getProjectFinanceReport);
router.get('/:id', getFinanceEntryById);
router.post('/', createFinanceEntry);
router.put('/:id', updateFinanceEntry);
router.delete('/:id', deleteFinanceEntry);

export default router;
