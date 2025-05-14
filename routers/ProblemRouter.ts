import { Router } from 'express';
import { authenticate } from '../middleware/authenticateToken';
import { getProblems } from '../controllers/ProblemController';

const router = Router();

router.get('/:id/problems', authenticate(['user', 'admin']), getProblems);

export default router;


