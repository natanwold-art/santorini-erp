import express from 'express';
import { getAllProjects, getProjectById, createProject, updateProject, deleteProject, getProjectsByStatus } from '../controllers/projectController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllProjects);
router.get('/status/:status', getProjectsByStatus);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
