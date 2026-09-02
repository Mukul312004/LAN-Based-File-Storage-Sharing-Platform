import config from './config/config.js';
import { createApp } from './app.js';
import { getPrimaryLanIp, getNetworkAddresses } from './utils/network.utils.js';
import storageService from './services/storage.service.js';

const app = createApp();

// Ensure local storage directory exists
storageService.ensureStorageDirExists();

const server = app.listen(config.port, '0.0.0.0', () => {
  const lanIp = getPrimaryLanIp();
  const addresses = getNetworkAddresses();

  console.log('====================================================');
  console.log(`🚀 Storage Node Started: "${config.serverName}"`);
  console.log(`📁 Local Storage Dir:   ${config.storageDir}`);
  console.log('----------------------------------------------------');
  console.log(`Local Access:    http://localhost:${config.port}`);
  console.log(`LAN Network:     http://${lanIp}:${config.port}`);
  
  if (addresses.length > 1) {
    console.log('Other Available Interfaces:');
    addresses.forEach((a) => {
      console.log(`  - [${a.interface}]: http://${a.address}:${config.port}`);
    });
  }
  console.log('====================================================');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down cleanly.');
  });
});

process.on('SIGINT', () => {
  console.log('Shutting down server (Ctrl+C)...');
  server.close(() => {
    console.log('Server shut down cleanly.');
  });
});
