import { Router } from 'express';
import { authenticate } from '../middleware/authenticateToken';
import { getContests } from '../controllers/ContestController';

const router = Router();

router.get('/:id/contests', authenticate(['user', 'admin']), getContests);

export default router;


