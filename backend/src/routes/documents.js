import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  downloadDocument,
  previewDocumentFile,
  readDocument,
  getDocumentFolders,
  createDocumentFolder,
  updateDocumentFolder,
  deleteDocumentFolder,
  moveDocumentToFolder,
  deleteDocument,
  getDocumentsByEntity,
} from '../controllers/documentController.js';
import { authenticateToken, authorizePermission } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });
const router = express.Router();

router.use(authenticateToken);
router.use(authorizePermission('documents'));

router.get('/', getAllDocuments);
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/folders', getDocumentFolders);
router.post('/folders', createDocumentFolder);
router.put('/folders/:id', updateDocumentFolder);
router.delete('/folders/:id', deleteDocumentFolder);
router.get('/download/:id', downloadDocument);
router.get('/file/:id', previewDocumentFile);
router.get('/read/:id', readDocument);
router.patch('/:id/folder', moveDocumentToFolder);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);
router.get('/:entityType/:entityId', getDocumentsByEntity);

export default router;
