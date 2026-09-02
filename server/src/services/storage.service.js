import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/config.js';

class StorageService {
  constructor() {
    this.storageDir = config.storageDir;
    this.ensureStorageDirExists();
  }

  /**
   * Ensure that the storage directory exists on disk
   */
  ensureStorageDirExists() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Sanitize an incoming filename to remove illegal filesystem characters and path sequences
   */
  sanitizeFilename(originalName) {
    if (!originalName || typeof originalName !== 'string') {
      return 'unnamed_file';
    }

    // Extract only the base name in case a full path was sent
    const base = path.basename(originalName);

    // Remove null bytes, path separators, control characters, and reserved Windows/Unix chars
    const sanitized = base
      .replace(/[\x00-\x1f\x7f<>:"/\\|?*]/g, '_')
      .replace(/\.{2,}/g, '.') // collapse multiple consecutive dots
      .trim();

    return sanitized.length > 0 ? sanitized : 'unnamed_file';
  }

  /**
   * Generate a unique stored filename while preserving the sanitized original name and extension
   */
  generateStoredFilename(originalName) {
    const sanitized = this.sanitizeFilename(originalName);
    const ext = path.extname(sanitized);
    const nameWithoutExt = path.basename(sanitized, ext);
    const uniqueId = uuidv4();

    // Format: <uuid>_<safe_name><ext>
    const safeName = nameWithoutExt.substring(0, 60); // limit base length
    return `${uniqueId}_${safeName}${ext}`;
  }

  /**
   * Resolve an absolute storage path and verify it is strictly within the configured storage directory
   */
  resolveSafePath(storedName) {
    // Check for directory traversal attempts in the filename
    if (storedName.includes('..') || path.isAbsolute(storedName)) {
      throw new Error('Invalid file path: path traversal detected');
    }

    const targetPath = path.resolve(this.storageDir, storedName);
    const relative = path.relative(this.storageDir, targetPath);

    // Ensure targetPath stays inside storageDir
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Access denied: target path is outside storage directory');
    }

    return targetPath;
  }

  /**
   * Safely delete a physical file from storage. Does not throw if file is already missing.
   */
  async deletePhysicalFile(storedName) {
    try {
      const filePath = this.resolveSafePath(storedName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting physical file ${storedName}:`, error.message);
      return false;
    }
  }

  /**
   * Check if a physical file exists
   */
  physicalFileExists(storedName) {
    try {
      const filePath = this.resolveSafePath(storedName);
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  /**
   * Get disk and storage statistics
   */
  async getStorageStats(trackedFileCount = 0, trackedTotalSize = 0) {
    this.ensureStorageDirExists();
    let totalSpace = 0;
    let freeSpace = 0;
    let usedSpace = 0;

    try {
      // Node 18.15+ supports fs.promises.statfs
      if (typeof fs.promises.statfs === 'function') {
        const stats = await fs.promises.statfs(this.storageDir);
        const bsize = stats.bsize || 4096;
        totalSpace = Number(stats.blocks) * bsize;
        freeSpace = Number(stats.bavail || stats.bfree) * bsize;
        usedSpace = totalSpace - freeSpace;
      }
    } catch (err) {
      console.warn('Could not read filesystem statfs, falling back to tracked usage:', err.message);
    }

    return {
      totalSpace: totalSpace > 0 ? totalSpace : 100 * 1024 * 1024 * 1024, // fallback 100GB
      freeSpace: freeSpace > 0 ? freeSpace : Math.max(0, 100 * 1024 * 1024 * 1024 - trackedTotalSize),
      usedSpace: usedSpace > 0 ? usedSpace : trackedTotalSize,
      appUsedSpace: trackedTotalSize,
      fileCount: trackedFileCount,
    };
  }
}

export const storageService = new StorageService();
export default storageService;
