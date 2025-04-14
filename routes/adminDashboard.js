import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import { 
  getRegisteredTeams, 
  getAllQuizzes, 
  Questions, 
  getQuizResults, 
  updateQuizStatus,
  getQuiz,
  getQuizDetails,
  updateQuizDetailsAdmin,
  deleteQuizDetails
} from '../controllers/adminDashboardControllers.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/teams', getRegisteredTeams);
router.get('/quizzes', getAllQuizzes); 
router.get('/quiz', getQuiz);
router.get('/quiz/details', getQuizDetails);
router.put('/quiz/questions', Questions); // Changed from updateQuizQuestions to Questions
router.get('/results', getQuizResults);
router.patch('/quiz/status', updateQuizStatus);
router.put('/quiz/details', updateQuizDetailsAdmin);
router.delete('/quiz/details', deleteQuizDetails); 
router.delete('/quiz/:quizId/question/:questionId', deleteQuizQuestion);
router.put('/quiz/:quizId/question/:questionId', editQuizQuestion);

export default router;