import { Router } from 'express';
import { getHealth, getServerInfo } from '../controllers/system.controller.js';

const router = Router();

router.get('/health', getHealth);
router.get('/info', getServerInfo);

export default router;
