import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllDocuments, getDocumentById, uploadDocument, downloadDocument, deleteDocument, getDocumentsByEntity } from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/auth.js';

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

router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/download/:id', downloadDocument);
router.delete('/:id', deleteDocument);
router.get('/:entityType/:entityId', getDocumentsByEntity);

export default router;
