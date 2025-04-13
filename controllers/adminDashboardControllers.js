import User from '../models/User.js';
import Quiz from '../models/quiz.js';
import Result from '../models/result.js';

export const getRegisteredTeams = async (req, res) => {
  try {
    const teams = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const updateQuizQuestions = async (req, res) => {
  try {
    const { questions, quizId } = req.body;
    
    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one question'
      });
    }
    
    for (const question of questions) {
      if (!question.questionText || !question.options || !Array.isArray(question.options) || 
          question.options.length < 2 || 
          typeof question.correctOption !== 'number' ||
          question.correctOption < 0 || 
          question.correctOption >= question.options.length) {
        return res.status(400).json({
          success: false,
          message: 'Invalid question format'
        });
      }
    }

    let quiz = await Quiz.findOne({ quizId });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    quiz.questions = questions;
    await quiz.save();
    
    return res.status(200).json({
      success: true,
      message: 'Quiz questions updated successfully',
      data: quiz
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const updateQuizDetailsAdmin = async (req, res) => {
  try {
    const { title, description, timeLimit, difficulty} = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be easy, medium, or hard'
      });
    }
    
    if (timeLimit !== undefined && (isNaN(timeLimit) || timeLimit < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Time limit must be a positive number or zero'
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

    quiz = await Quiz.create({
      title,
      description: description || '',
      timeLimit: timeLimit || 0,
      difficulty: difficulty || 'medium',
      quizId
    });
    
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (err) {
    console.error('Error updating quiz details:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const updateQuizStatus = async (req, res) => {
  try {
    const { status, quizId } = req.body;
    
    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }
    
    if (!['pending', 'active', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, active, or completed'
      });
    }
    
    let quiz = await Quiz.findOne({ quizId });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    quiz.status = status;
    
    if (status === 'active' && !quiz.startTime) {
      quiz.startTime = new Date();
    }
    
    if (status === 'completed' && !quiz.endTime) {
      quiz.endTime = new Date();
    }
    
    await quiz.save();
    
    res.status(200).json({
      success: true,
      message: `Quiz status updated to ${status}`,
      data: quiz
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('title status quizId createdAt');
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getQuizDetails = async (req, res) => {
  try {
    const { quizId } = req.query;
    
    if (quizId) {
      const quiz = await Quiz.findOne({ quizId });
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
      
      const quizDetails = {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description || "",
        timeLimit: quiz.timeLimit || 0,
        difficulty: quiz.difficulty || "medium",
        status: quiz.status,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        quizId: quiz.quizId,
        createdAt: quiz.createdAt,
        questionCount: quiz.questions ? quiz.questions.length : 0
      };
      
      return res.status(200).json({
        success: true,
        data: quizDetails
      });
    }
    
    const quizzes = await Quiz.find();
    
    const allQuizDetails = quizzes.map(quiz => ({
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description || "",
      timeLimit: quiz.timeLimit || 0,
      difficulty: quiz.difficulty || "medium",
      status: quiz.status,
      startTime: quiz.startTime,
      endTime: quiz.endTime,
      quizId: quiz.quizId,
      createdAt: quiz.createdAt,
      questionCount: quiz.questions ? quiz.questions.length : 0
    }));
    
    res.status(200).json({
      success: true,
      count: allQuizDetails.length,
      data: allQuizDetails
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const deleteQuizDetails = async (req, res) => {
  try {
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
    
    const resultsCount = await Result.countDocuments({ quiz: quiz._id });
    
    if (resultsCount > 0) {
      quiz.title = "Main Quiz"; 
      quiz.description = ""; 
      quiz.timeLimit = 0; 
      quiz.difficulty = "medium"; 
      
      await quiz.save();
      
      return res.status(200).json({
        success: true,
        message: 'Quiz has submissions. Details reset to default values instead of deleting.',
        data: quiz
      });
    }
    
    await Quiz.deleteOne({ quizId });
    
    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting quiz:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getQuiz = async (req, res) => {
  try {
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
    
    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getQuizResults = async (req, res) => {
  try {
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
    
    const results = await Result.find({ quiz: quiz._id })
      .populate('userId', 'teamName email')
      .sort('-score');
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};