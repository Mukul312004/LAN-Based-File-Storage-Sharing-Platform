import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const rootDir = path.resolve(__dirname, '../../../');
const storageDirEnv = process.env.STORAGE_DIR || './storage';
const resolvedStorageDir = path.isAbsolute(storageDirEnv)
  ? storageDirEnv
  : path.resolve(rootDir, storageDirEnv);

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  serverName: process.env.SERVER_NAME || `${os.hostname()} Node`,
  storageDir: resolvedStorageDir,
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || `${1024 * 1024 * 1024 * 5}`, 10), // 5GB default limit
  discovery: {
    enabled: process.env.DISCOVERY_ENABLED !== 'false',
    port: parseInt(process.env.DISCOVERY_PORT || '41234', 10),
    broadcastInterval: parseInt(process.env.DISCOVERY_BROADCAST_INTERVAL || '3000', 10),
    peerTimeout: parseInt(process.env.PEER_TIMEOUT || '10000', 10),
  },
};

export default config;
