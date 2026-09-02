import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import storageService from '../src/services/storage.service.js';

describe('Security & Error Handling Hardening Suite', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  describe('Path Traversal & Filename Sanitization', () => {
    it('should sanitize dangerous filenames containing path separators and null bytes', () => {
      const sanitized1 = storageService.sanitizeFilename('../../etc/passwd');
      expect(sanitized1).not.toContain('/');
      expect(sanitized1).not.toContain('..');

      const sanitized2 = storageService.sanitizeFilename('..\\..\\windows\\system32\\cmd.exe');
      expect(sanitized2).not.toContain('\\');
      expect(sanitized2).not.toContain('..');

      const sanitized3 = storageService.sanitizeFilename('test\x00file.png');
      expect(sanitized3).not.toContain('\x00');
    });

    it('should preserve safe characters and unicode in legitimate filenames', () => {
      const sanitized = storageService.sanitizeFilename('My Resume (2026) - Final.pdf');
      expect(sanitized).toBe('My Resume (2026) - Final.pdf');
    });

    it('should prevent path traversal via resolveSafePath', () => {
      expect(() => storageService.resolveSafePath('../../secret.txt')).toThrow();
      expect(() => storageService.resolveSafePath('/etc/passwd')).toThrow();
      expect(() => storageService.resolveSafePath('C:\\Windows\\System32\\calc.exe')).toThrow();
    });
  });

  describe('API Error Handling', () => {
    it('POST /api/files - should return 400 when no file is attached', async () => {
      const res = await request(app).post('/api/files');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/no file provided/i);
    });

    it('GET /api/files/:id - should return 404 for invalid/non-existent UUID', async () => {
      const res = await request(app).get('/api/files/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /non-existent-route - should return 404 with structured JSON', async () => {
      const res = await request(app).get('/api/invalid-route-xyz');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Not Found');
    });
  });
});
