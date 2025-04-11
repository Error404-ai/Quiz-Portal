import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getActiveQuiz, 
  submitQuizAnswers, 
  getUserResult,
  updateQuizDetails 
} from '../controllers/quizControllers.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActiveQuiz);
router.post('/submit', submitQuizAnswers);
router.get('/result', getUserResult);
router.put('/details', updateQuizDetails);

export default router;