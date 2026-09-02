import { Router } from 'express';
import { getDiscoveredDevices, addManualDevice, scanSubnet } from '../controllers/discovery.controller.js';

const router = Router();

router.get('/', getDiscoveredDevices);
router.post('/scan', scanSubnet);
router.post('/manual', addManualDevice);

export default router;
