import prisma from '../db/prisma.js';
import storageService from './storage.service.js';
import { formatFileMetadata } from '../utils/serializer.utils.js';

class FileService {
  /**
   * List all stored file records
   */
  async listFiles() {
    const files = await prisma.fileMetadata.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return formatFileMetadata(files);
  }

  /**
   * Get a single file record by ID
   */
  async getFileById(id) {
    if (!id || typeof id !== 'string') {
      return null;
    }
    const file = await prisma.fileMetadata.findUnique({
      where: { id },
    });
    return formatFileMetadata(file);
  }

  /**
   * Register a newly uploaded file in MySQL metadata.
   * If database operation fails, automatically deletes the physical file from disk.
   */
  async registerUploadedFile(uploadedFile) {
    const { originalname, filename: storedName, path: storagePath, size, mimetype } = uploadedFile;

    try {
      const newFile = await prisma.fileMetadata.create({
        data: {
          originalName: storageService.sanitizeFilename(originalname),
          storedName,
          storagePath,
          fileSize: BigInt(size),
          mimeType: mimetype || 'application/octet-stream',
        },
      });

      return formatFileMetadata(newFile);
    } catch (dbError) {
      // Database failed: clean up orphaned physical file from disk immediately
      await storageService.deletePhysicalFile(storedName);
      throw new Error(`Failed to save file metadata to database: ${dbError.message}`);
    }
  }

  /**
   * Delete file from both database and physical filesystem
   */
  async deleteFile(id) {
    const file = await prisma.fileMetadata.findUnique({
      where: { id },
    });

    if (!file) {
      const error = new Error('File not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete physical file from filesystem
    await storageService.deletePhysicalFile(file.storedName);

    // Delete database metadata record
    await prisma.fileMetadata.delete({
      where: { id },
    });

    return formatFileMetadata(file);
  }

  /**
   * Get file count and total size stored in MySQL
   */
  async getFileStats() {
    const count = await prisma.fileMetadata.count();
    const aggregate = await prisma.fileMetadata.aggregate({
      _sum: {
        fileSize: true,
      },
    });

    const totalBytes = aggregate._sum.fileSize ? Number(aggregate._sum.fileSize) : 0;
    return {
      count,
      totalBytes,
    };
  }
}

export const fileService = new FileService();
export default fileService;
