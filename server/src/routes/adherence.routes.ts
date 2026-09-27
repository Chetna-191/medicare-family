import { Router } from 'express';
import { getAdherenceStats } from '../controllers/adherenceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAdherenceStats);

export default router;
