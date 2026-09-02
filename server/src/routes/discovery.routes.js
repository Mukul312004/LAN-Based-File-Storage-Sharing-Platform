import { Router } from 'express';
import {
  getDiscoveredDevices,
  recordClientHeartbeat,
  addManualDevice,
  scanSubnet,
  removeDevice,
  clearOfflineDevices,
} from '../controllers/discovery.controller.js';

const router = Router();

router.get('/', getDiscoveredDevices);
router.post('/heartbeat', recordClientHeartbeat);
router.post('/scan', scanSubnet);
router.post('/manual', addManualDevice);
router.post('/clear-offline', clearOfflineDevices);
router.delete('/:id', removeDevice);

export default router;
