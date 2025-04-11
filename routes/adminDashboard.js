import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import { 
  getRegisteredTeams, 
  updateQuizQuestions, 
  getQuizResults, 
  updateQuizStatus,
  getQuiz
} from '../controllers/adminDashboardControllers.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/teams', getRegisteredTeams);
router.get('/quiz', getQuiz);
router.put('/quiz/questions', updateQuizQuestions);
router.get('/results', getQuizResults);
router.patch('/quiz/status', updateQuizStatus);

export default router;