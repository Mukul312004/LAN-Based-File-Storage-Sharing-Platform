import path from 'path';
import os from 'os';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { getLocalIpAddress } from '../utils/network.js';

// Resolve directory paths in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

// Load .env from root directory if it exists, otherwise server directory
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';
const lanIp = getLocalIpAddress();
const defaultDeviceName = `${os.hostname()} (${os.platform()})`;
const deviceName = process.env.DEVICE_NAME || defaultDeviceName;

const storagePath = path.resolve(
  rootDir,
  process.env.STORAGE_DIR || './storage'
);

export const config = {
  env: process.env.NODE_ENV || 'development',
  port,
  host,
  lanIp,
  deviceName,
  storagePath,
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/local_storage',
  discovery: {
    port: parseInt(process.env.DISCOVERY_PORT || '41234', 10),
    intervalMs: parseInt(process.env.DISCOVERY_INTERVAL_MS || '3000', 10),
    peerTimeoutMs: parseInt(process.env.DISCOVERY_PEER_TIMEOUT_MS || '10000', 10),
  }
};
