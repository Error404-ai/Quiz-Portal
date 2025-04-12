import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import { 
  getRegisteredTeams, 
  updateQuizQuestions, 
  getQuizResults, 
  updateQuizStatus,
  getQuiz,
  getQuizDetails
} from '../controllers/adminDashboardControllers.js';
import { updateQuizDetails } from '../controllers/quizControllers.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/teams', getRegisteredTeams);
router.get('/quiz', getQuiz);
router.get('/quiz/details', getQuizDetails);
router.put('/quiz/questions', updateQuizQuestions);
router.get('/results', getQuizResults);
router.patch('/quiz/status', updateQuizStatus);
router.put('/quiz/details', updateQuizDetails);

export default router;