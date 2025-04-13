import Quiz from '../models/quiz.js';
import Result from '../models/result.js';

export const getActiveQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ status: 'active' });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'No active quiz found'
      });
    }
    
    const quizForStudent = {
      _id: quiz._id,
      title: quiz.title,
      quizId: quiz.quizId,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        points: q.points
      })),
      startTime: quiz.startTime,
      timeLimit: quiz.timeLimit
    };
    
    res.status(200).json({
      success: true,
      data: quizForStudent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const submitQuizAnswers = async (req, res) => {
  try {
    const { answers, quizId } = req.body;
    const userId = req.user.id;
    
    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your answers'
      });
    }
    
    const quiz = await Quiz.findOne({ quizId });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (quiz.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This quiz is not active'
      });
    }
    
    const existingResult = await Result.findOne({ 
      user: userId,
      quiz: quiz._id
    });
    
    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted the quiz'
      });
    }
    
    let score = 0;
    const processedAnswers = [];
    
    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId);
      
      if (!question) continue;
      
      const isCorrect = question.correctOption === answer.selectedOption;
      
      if (isCorrect) {
        score += question.points || 1;
      }
      
      processedAnswers.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect
      });
    }
    
    const result = await Result.create({
      user: userId,
      quiz: quiz._id,
      answers: processedAnswers,
      score
    });
    
    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score,
        totalPoints: quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getUserResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId } = req.query;
    
    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }
    
    const quiz = await Quiz.findOne({ quizId });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    const result = await Result.findOne({ 
      user: userId,
      quiz: quiz._id
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No quiz result found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const updateQuizDetails = async (req, res) => {
  try {
    const { title, description, timeLimit, difficulty, quizId } = req.body;
    
    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }
    
    let quiz = await Quiz.findOne({ quizId });
    
    if (quiz) {
      if (title) quiz.title = title;
      if (description !== undefined) quiz.description = description;
      if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
      if (difficulty) quiz.difficulty = difficulty;
      
      await quiz.save();
      
      return res.status(200).json({
        success: true,
        message: 'Quiz details updated successfully',
        data: quiz
      });
    }
    
    return res.status(404).json({
      success: false,
      message: 'Quiz not found'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};