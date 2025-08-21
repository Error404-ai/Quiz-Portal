import Quiz from '../models/quiz.js';
import Result from '../models/result.js';

// Helper function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper function to get or create question order for a user
// Helper function to get or create question order for a user
const getOrCreateQuestionOrder = async (userId, quiz) => {
  let existingResult = await Result.findOne({
    user: userId,
    quiz: quiz._id
  });

  if (!existingResult) {
    // Use true as default if shuffleQuestions is false or undefined
    const shouldShuffle = quiz.shuffleQuestions !== false; 
    
    const questionOrder = shouldShuffle
      ? shuffleArray(quiz.questions.map(q => q._id.toString())) 
      : quiz.questions.map(q => q._id.toString());
    
    existingResult = await Result.create({
      user: userId,
      quiz: quiz._id,
      startTime: new Date(),
      answers: [],
      score: 0,
      attemptedQuestions: [],
      questionOrder: questionOrder
    });
    
    console.log(`Created new result with shuffled order:`, shouldShuffle ? 'YES' : 'NO');
  } else if (!existingResult.questionOrder || existingResult.questionOrder.length === 0) {
    // Use true as default if shuffleQuestions is false or undefined
    const shouldShuffle = quiz.shuffleQuestions !== false;
    
    const questionOrder = shouldShuffle
      ? shuffleArray(quiz.questions.map(q => q._id.toString())) 
      : quiz.questions.map(q => q._id.toString());
    
    existingResult.questionOrder = questionOrder;
    await existingResult.save();
    
    console.log(`Updated existing result with shuffled order:`, shouldShuffle ? 'YES' : 'NO');
  }

  return existingResult;
};

export const getActiveQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ status: 'active' });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'No active quiz found'
      });
    }
    
    const userId = req.user.id;
    const existingResult = await getOrCreateQuestionOrder(userId, quiz);
    
    const userAttemptedQuestions = existingResult.attemptedQuestions || [];
    
    // Always use the stored question order
    const orderedQuestions = existingResult.questionOrder.map(questionId => {
      const question = quiz.questions.find(q => q._id.toString() === questionId);
      if (!question) return null;
      
      return {
        _id: question._id,
        questionText: question.questionText,
        imageUrl: question.imageUrl,
        options: question.options,
        points: question.points,
        attempted: userAttemptedQuestions.some(id => id.toString() === question._id.toString())
      };
    }).filter(q => q !== null);
    
    const quizForStudent = {
      _id: quiz._id,
      title: quiz.title,
      questions: orderedQuestions,
      startTime: quiz.startTime,
      timeLimit: quiz.timeLimit,
      shuffled: quiz.shuffleQuestions
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

export const getQuizQuestion = async (req, res) => {
  try {
    const { quizId, questionIndex } = req.query;
    const userId = req.user.id;
    
    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }
    
    const index = parseInt(questionIndex, 10);
    if (isNaN(index)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (!quiz.questions || quiz.questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found in this quiz'
      });
    }
    
    // Get or create question order
    const existingResult = await getOrCreateQuestionOrder(userId, quiz);
    
    // Validate that we have a question order
    if (!existingResult.questionOrder || existingResult.questionOrder.length === 0) {
      console.error("Question order is still empty after initialization");
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize question order',
      });
    }
    
    // Check if index is valid
    if (index < 0 || index >= existingResult.questionOrder.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid question index: ${index} (max: ${existingResult.questionOrder.length - 1})`,
      });
    }
    
    // Get question using the stored order
    const questionId = existingResult.questionOrder[index];
    const questionData = quiz.questions.find(q => q._id.toString() === questionId.toString());
    
    if (!questionData) {
      console.error(`Question not found: questionId=${questionId}, index=${index}`);
      return res.status(404).json({
        success: false,
        message: 'Question not found in quiz',
      });
    }
    
    const attempted = existingResult.attemptedQuestions 
      ? existingResult.attemptedQuestions.some(q => q.toString() === questionData._id.toString())
      : false;
    
    const sanitizedQuestion = {
      _id: questionData._id,
      questionText: questionData.questionText,
      imageUrl: questionData.imageUrl || null,
      options: questionData.options,
      points: questionData.points || 1,
      attempted: attempted
    };
    
    const responseData = {
      success: true,
      data: {
        quizTitle: quiz.title,
        quizId: quiz._id,
        timeLimit: quiz.timeLimit || 0,
        totalQuestions: quiz.questions.length,
        currentQuestion: index + 1,
        questionData: sanitizedQuestion
      }
    };
    
    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error getting quiz question:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getQuizQuestions = async (req, res) => {
  try {
    const { quizId } = req.query;
    const userId = req.user?.id;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required.',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User ID is missing.',
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.',
      });
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found in this quiz.',
      });
    }

    // Get or create result with proper question order
    const existingResult = await getOrCreateQuestionOrder(userId, quiz);
    const userAttemptedQuestions = existingResult.attemptedQuestions || [];

    // Order questions based on stored question order
    const orderedQuestions = existingResult.questionOrder
      .map((questionId) => {
        const question = quiz.questions.find((q) => q._id.toString() === questionId);
        if (!question) return null;

        const isAttempted = userAttemptedQuestions.some(
          (id) => id.toString() === question._id.toString()
        );

        return {
          _id: question._id,
          questionText: question.questionText,
          imageUrl: question.imageUrl || null,
          options: question.options,
          points: question.points || 1,
          attempted: isAttempted,
        };
      })
      .filter((q) => q !== null);

    // Calculate total possible points
    const totalPoints = quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0);

    const responseData = {
      success: true,
      data: {
        quizId: quiz._id,
        quizTitle: quiz.title,
        description: quiz.description || null,
        timeLimit: quiz.timeLimit || 0,
        difficulty: quiz.difficulty || 'medium',
        status: quiz.status,
        totalQuestions: quiz.questions.length,
        totalPoints: totalPoints,
        currentScore: existingResult.score || 0,
        shuffled: quiz.shuffleQuestions || false,
        userStartTime: existingResult.startTime,
        userSubmittedAt: existingResult.submittedAt || null,
        isCompleted: existingResult.isCompleted || false,
        questions: orderedQuestions,
      },
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error getting quiz questions:', err);
    res.status(500).json({
      success: false,
      message: 'Server error.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// Other existing functions remain unchanged
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
    
    let existingResult = await Result.findOne({ 
      user: userId,
      quiz: quiz._id
    });
    
    if (existingResult && existingResult.answers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted the quiz'
      });
    }
    
    let score = 0;
    const processedAnswers = [];
    const attemptedQuestionIds = answers.map(answer => answer.questionId);
    
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
    
    if (existingResult) {
      existingResult.answers = processedAnswers;
      existingResult.score = score;
      existingResult.submittedAt = new Date();
      existingResult.attemptedQuestions = Array.from(new Set([
        ...existingResult.attemptedQuestions,
        ...attemptedQuestionIds
      ]));
      
      await existingResult.save();
      
      return res.status(200).json({
        success: true,
        message: 'Quiz submitted successfully',
        data: {
          score,
          totalPoints: quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0)
        }
      });
    }
    
    const result = await Result.create({
      user: userId,
      quiz: quiz._id,
      answers: processedAnswers,
      attemptedQuestions: attemptedQuestionIds,
      score,
      startTime: new Date(),
      submittedAt: new Date()
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

export const markQuestionAttempted = async (req, res) => {
  try {
    const { quizId, questionId } = req.body;
    const userId = req.user.id;
    
    if (!quizId || !questionId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and Question ID are required'
      });
    }
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    const question = quiz.questions.id(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    let result = await Result.findOne({
      user: userId,
      quiz: quizId
    });
    
    if (!result) {
      result = new Result({
        user: userId,
        quiz: quizId,
        startTime: new Date(),
        answers: [],
        attemptedQuestions: [questionId]
      });
    } else {
      if (!result.attemptedQuestions) {
        result.attemptedQuestions = [];
      }
      
      if (!result.attemptedQuestions.some(q => q.toString() === questionId.toString())) {
        result.attemptedQuestions.push(questionId);
      }
    }
    
    await result.save();
    
    res.status(200).json({
      success: true,
      message: 'Question marked as attempted',
      data: {
        quizId,
        questionId,
        attempted: true
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