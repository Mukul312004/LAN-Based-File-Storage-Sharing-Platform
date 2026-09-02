import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from '../src/app.js';
import storageService from '../src/services/storage.service.js';
import prisma from '../src/db/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Storage Node API & File Operations (Phase 2)', () => {
  let app;
  let testFileId;
  const testFileName = 'test-upload-sample.txt';
  const testFileContent = 'Hello LAN File Storage - Automated Test Content';
  const tempTestFilePath = path.join(__dirname, testFileName);

  beforeAll(async () => {
    app = createApp();
    // Create local temp file for upload test
    fs.writeFileSync(tempTestFilePath, testFileContent, 'utf-8');
  });

  afterAll(async () => {
    // Clean up temporary local fixture
    if (fs.existsSync(tempTestFilePath)) {
      fs.unlinkSync(tempTestFilePath);
    }
  });

  it('GET /api/health - should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/info - should return node information and storage stats', async () => {
    const res = await request(app).get('/api/info');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.serverName).toBeDefined();
    expect(res.body.data.host).toBeDefined();
    expect(res.body.data.storage).toBeDefined();
    expect(res.body.data.capabilities).toContain('file:stream');
  });

  it('POST /api/files - should upload a file and return 201 with metadata', async () => {
    const res = await request(app)
      .post('/api/files')
      .attach('file', tempTestFilePath);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.originalName).toBe(testFileName);
    expect(res.body.data.fileSize).toBe(Buffer.byteLength(testFileContent));

    testFileId = res.body.data.id;

    // Verify physical file exists on disk
    expect(storageService.physicalFileExists(res.body.data.storedName)).toBe(true);
  });

  it('GET /api/files - should list the uploaded file', async () => {
    const res = await request(app).get('/api/files');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const uploaded = res.body.data.find((f) => f.id === testFileId);
    expect(uploaded).toBeDefined();
    expect(uploaded.originalName).toBe(testFileName);
  });

  it('GET /api/files/:id - should get metadata for specific file', async () => {
    const res = await request(app).get(`/api/files/${testFileId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testFileId);
    expect(res.body.data.originalName).toBe(testFileName);
  });

  it('GET /api/files/:id/download - should stream download file content with correct headers', async () => {
    const res = await request(app).get(`/api/files/${testFileId}/download`);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain(testFileName);
    expect(res.text).toBe(testFileContent);
  });

  it('GET /api/files/:id/download - should return 404 for non-existent file', async () => {
    const res = await request(app).get('/api/files/non-existent-uuid-12345/download');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('StorageService - should prevent directory traversal attempts', () => {
    expect(() => storageService.resolveSafePath('../../etc/passwd')).toThrow(/path traversal/i);
    expect(() => storageService.resolveSafePath('..\\..\\windows\\system32')).toThrow(/path traversal/i);
  });

  it('DELETE /api/files/:id - should remove file and physical disk content', async () => {
    const fileRecord = await prisma.fileMetadata.findUnique({ where: { id: testFileId } });
    const storedName = fileRecord.storedName;

    const res = await request(app).delete(`/api/files/${testFileId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify removed from MySQL
    const dbCheck = await prisma.fileMetadata.findUnique({ where: { id: testFileId } });
    expect(dbCheck).toBeNull();

    // Verify removed from physical filesystem
    expect(storageService.physicalFileExists(storedName)).toBe(false);
  });

  it('DELETE /api/files/:id - should return 404 when deleting an already deleted file', async () => {
    const res = await request(app).delete(`/api/files/${testFileId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
