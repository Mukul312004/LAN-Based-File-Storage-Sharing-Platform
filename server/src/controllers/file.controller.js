import fs from 'fs';
import fileService from '../services/file.service.js';
import storageService from '../services/storage.service.js';

export const listFiles = async (req, res, next) => {
  try {
    const files = await fileService.listFiles();
    res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

export const getFileById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await fileService.getFileById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    res.json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided in multipart request',
      });
    }

    const createdRecord = await fileService.registerUploadedFile(req.file);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: createdRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await fileService.getFileById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File metadata not found',
      });
    }

    let filePath;
    try {
      filePath = storageService.resolveSafePath(file.storedName);
    } catch (pathErr) {
      return res.status(403).json({
        success: false,
        error: pathErr.message,
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Physical file not found on server storage',
      });
    }

    const stat = await fs.promises.stat(filePath);
    const safeEncodedName = encodeURIComponent(file.originalName).replace(/['()]/g, escape);

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.originalName.replace(/"/g, '')}"; filename*=UTF-8''${safeEncodedName}`
    );

    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      console.error('Download stream error:', streamErr);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Streaming error occurred' });
      }
    });

    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await fileService.deleteFile(id);

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};
