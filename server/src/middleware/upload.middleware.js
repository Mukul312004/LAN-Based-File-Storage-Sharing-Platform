import multer from 'multer';
import storageService from '../services/storage.service.js';
import config from '../config/config.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    storageService.ensureStorageDirExists();
    cb(null, config.storageDir);
  },
  filename: (req, file, cb) => {
    try {
      const storedName = storageService.generateStoredFilename(file.originalname);
      cb(null, storedName);
    } catch (err) {
      cb(err);
    }
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
    files: 1, // Single file per request in MVP
  },
});

export default upload;
