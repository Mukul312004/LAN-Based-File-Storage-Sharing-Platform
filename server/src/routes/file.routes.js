import { Router } from 'express';
import {
  listFiles,
  getFileById,
  uploadFile,
  downloadFile,
  deleteFile,
} from '../controllers/file.controller.js';
import upload from '../middleware/upload.middleware.js';

const router = Router();

router.get('/', listFiles);
router.post('/', upload.single('file'), uploadFile);
router.get('/:id', getFileById);
router.get('/:id/download', downloadFile);
router.delete('/:id', deleteFile);

export default router;
