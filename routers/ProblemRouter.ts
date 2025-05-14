import { Router } from 'express';
import { authenticate } from '../middleware/authenticateToken';
import { getProblemStats } from '../services/ProblemService';

const router = Router();

router.get('/problems/:id', authenticate(['user', 'admin']), getProblemStats);

export default router;


