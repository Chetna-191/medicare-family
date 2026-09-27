import { Router } from 'express';
import { getDailySchedule, updateDoseStatus } from '../controllers/scheduleController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getDailySchedule);
router.post('/status', updateDoseStatus);

export default router;
