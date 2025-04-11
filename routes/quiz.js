import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getActiveQuiz, 
  submitQuizAnswers, 
  getUserResult 
} from '../controllers/quizControllers.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActiveQuiz);
router.post('/submit', submitQuizAnswers);
router.get('/result', getUserResult);

export default router;