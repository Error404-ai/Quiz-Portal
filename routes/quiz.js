import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getActiveQuiz, 
  getAvailableQuizzes,
  submitQuizAnswers, 
  getUserResult,
  updateQuizDetails,
  getQuizQuestion
} from '../controllers/quizControllers.js';

const router = express.Router();

router.use(protect);

router.get('/available', getAvailableQuizzes);
router.get('/active', getActiveQuiz);
router.post('/submit', submitQuizAnswers);
router.get('/result', getUserResult);
router.put('/details', updateQuizDetails);
router.get('/question', getQuizQuestion);

export default router;