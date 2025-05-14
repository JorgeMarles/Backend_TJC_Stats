import { Router } from 'express';
import { authenticate } from '../middleware/authenticateToken';
import { getContests } from '../controllers/ContestController';

const router = Router();

router.get('/contests/:id', authenticate(['user', 'admin']), getContests);

export default router;


