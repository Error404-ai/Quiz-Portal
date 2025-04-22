import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getActiveQuiz, 
  getAvailableQuizzes,
  submitQuizAnswers, 
  getUserResult,
  updateQuizDetails,
  getQuizQuestion,
  markQuestionAttempted,
  startQuiz,
  getQuizTimingDetails
} from '../controllers/quizControllers.js';

const router = express.Router();

router.use(protect);

router.get('/available', getAvailableQuizzes);
router.get('/active', getActiveQuiz);
router.post('/start', startQuiz); 
router.post('/submit', submitQuizAnswers);
router.get('/result', getUserResult);
router.get('/timing', getQuizTimingDetails); 
router.put('/details', updateQuizDetails);
router.get('/question', getQuizQuestion);
router.post('/question/attempt', markQuestionAttempted);

export default router;