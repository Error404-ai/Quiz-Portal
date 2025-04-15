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

export const getAvailableQuizzes = async (req, res) => {
  try {

    console.log(`Total quizzes in DB: ${await Quiz.countDocuments()}`);
    const quizzes = await Quiz.find({})
      .select('_id title description timeLimit difficulty status startTime')
      .sort('-createdAt');
    
    const formattedQuizzes = quizzes.map(quiz => ({
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      difficulty: quiz.difficulty,
      status: quiz.status,
      startTime: quiz.startTime
    }));
    
    res.status(200).json({
      success: true,
      count: formattedQuizzes.length,
      data: formattedQuizzes
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
    const { answers, _id } = req.body;
    const userId = req.user.id;
    
    if (!_id) {
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
    
    const quiz = await Quiz.findById(_id);
    
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
    const { _id } = req.query;
    
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }
    
    const quiz = await Quiz.findById(_id);
    
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
    const { title, description, timeLimit, difficulty, _id } = req.body;
    
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }
    
    let quiz = await Quiz.findById(_id);
    
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

export const getQuizQuestion = async (req, res) => {
  try {
    const { quizId, questionIndex } = req.query;
    
    // Force immediate console output
    process.stdout.write(`[DEBUG] Request parameters: ${JSON.stringify({ quizId, questionIndex })}\n`);
    
    if (!quizId) {
      console.error('[ERROR] Quiz ID is required');
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }
    
    const index = parseInt(questionIndex) || 0;
    process.stdout.write(`[DEBUG] Parsed question index: ${index}\n`);
    
    const quiz = await Quiz.findById(quizId);
    process.stdout.write(`[DEBUG] Quiz found: ${quiz ? "Yes" : "No"}\n`);
    
    if (!quiz) {
      console.error('[ERROR] Quiz not found');
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Force logs to output
    process.stdout.write(`[DEBUG] Quiz questions available: ${quiz.questions ? quiz.questions.length : 0}\n`);
    
    if (!quiz.questions || quiz.questions.length === 0) {
      console.error('[ERROR] No questions found in this quiz');
      return res.status(404).json({
        success: false,
        message: 'No questions found in this quiz'
      });
    }
    
    if (index < 0 || index >= quiz.questions.length) {
      console.error('[ERROR] Invalid question index');
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }
    
    const question = quiz.questions[index];
    process.stdout.write(`[DEBUG] Question found: ${question ? "Yes" : "No"}\n`);
    process.stdout.write(`[DEBUG] Question options: ${JSON.stringify(question.options)}\n`);
    process.stdout.write(`[DEBUG] Options type: ${Array.isArray(question.options) ? "Array" : typeof question.options}\n`);
    process.stdout.write(`[DEBUG] Options length: ${question.options ? question.options.length : 0}\n`);
    
    const sanitizedQuestion = {
      _id: question._id,
      questionText: question.questionText,
      options: question.options,
      points: question.points
    };
    
    process.stdout.write(`[DEBUG] Sanitized question: ${JSON.stringify(sanitizedQuestion)}\n`);
    process.stdout.write(`[DEBUG] Sanitized options: ${JSON.stringify(sanitizedQuestion.options)}\n`);
    
    const responseData = {
      success: true,
      data: {
        quizTitle: quiz.title,
        quizId: quiz._id,
        timeLimit: quiz.timeLimit,
        totalQuestions: quiz.questions.length,
        currentQuestion: index + 1,
        questionData: sanitizedQuestion
      }
    };
    
    process.stdout.write(`[DEBUG] Sending response: ${JSON.stringify(responseData, null, 2)}\n`);
    
    res.status(200).json(responseData);
  } catch (err) {
    console.error('[ERROR] Error getting quiz question:', err);
    process.stdout.write(`[ERROR] Stack trace: ${err.stack}\n`);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};