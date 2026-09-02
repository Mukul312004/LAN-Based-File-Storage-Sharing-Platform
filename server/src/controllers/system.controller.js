import config from '../config/config.js';
import { getPrimaryLanIp, getNetworkAddresses } from '../utils/network.utils.js';
import fileService from '../services/file.service.js';
import storageService from '../services/storage.service.js';

export const getHealth = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

export const getServerInfo = async (req, res, next) => {
  try {
    const primaryIp = getPrimaryLanIp();
    const networkInterfaces = getNetworkAddresses();
    const fileStats = await fileService.getFileStats();
    const storageStats = await storageService.getStorageStats(fileStats.count, fileStats.totalBytes);

    res.json({
      success: true,
      data: {
        serverName: config.serverName,
        version: '1.0.0',
        port: config.port,
        host: primaryIp,
        networkInterfaces,
        storage: storageStats,
        capabilities: [
          'file:read',
          'file:write',
          'file:delete',
          'file:stream',
          'lan:discovery',
        ],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
