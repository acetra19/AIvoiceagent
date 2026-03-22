import { Router } from 'express';
import { API_VERSION } from '../../config';
import webhookRoutes from './webhook.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use(`/api/${API_VERSION}`, webhookRoutes);
router.use(`/api/${API_VERSION}`, healthRoutes);

export default router;
