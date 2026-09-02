import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { config } from './config/index.js';
import { checkDbConnection } from './db/prisma.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure physical storage folder exists
if (!fs.existsSync(config.storagePath)) {
  fs.mkdirSync(config.storagePath, { recursive: true });
}

// Basic health check for Phase 1 verification
app.get('/api/health', async (req, res) => {
  const dbConnected = await checkDbConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    device: config.deviceName,
    lanIp: config.lanIp,
    port: config.port,
  });
});

app.get('/api/info', async (req, res) => {
  res.json({
    name: config.deviceName,
    version: '1.0.0',
    port: config.port,
    lanIp: config.lanIp,
    status: 'online',
    capabilities: ['upload', 'download', 'delete', 'browse', 'discovery'],
  });
});

// Start Express server
const server = app.listen(config.port, config.host, () => {
  console.log('\n==================================================');
  console.log('  🚀 LAN Storage Server started successfully');
  console.log('==================================================');
  console.log(`  Device:   ${config.deviceName}`);
  console.log(`  Local:    http://localhost:${config.port}`);
  console.log(`  Network:  http://${config.lanIp}:${config.port}`);
  console.log(`  Storage:  ${config.storagePath}`);
  console.log('==================================================\n');
});

export { app, server };
