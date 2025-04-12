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
    const { questions } = req.body;
    
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
    
    let quiz = await Quiz.findOne();
    
    if (quiz) {
      quiz.questions = questions;
      await quiz.save();
      
      return res.status(200).json({
        success: true,
        message: 'Quiz questions updated successfully',
        data: quiz
      });
    }
    
    quiz = await Quiz.create({
      title: "Main Quiz",
      questions
    });
    
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
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
    const results = await Result.find()
      .populate('user', 'teamName teamLeaderName email')
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

export const updateQuizStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'active', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, active, or completed'
      });
    }
    
    let quiz = await Quiz.findOne();
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found. Please create a quiz first.'
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

export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne();
    
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

export const getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findOne();
    
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
      createdAt: quiz.createdAt
    };
    
    res.status(200).json({
      success: true,
      data: quizDetails
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// New function to handle quiz details update for admin
export const updateQuizDetailsAdmin = async (req, res) => {
  try {
    const { title, description, timeLimit, difficulty } = req.body;
    
    // Validate input
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    // Validate difficulty if provided
    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be easy, medium, or hard'
      });
    }
    
    // Validate timeLimit if provided
    if (timeLimit !== undefined && (isNaN(timeLimit) || timeLimit < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Time limit must be a positive number or zero'
      });
    }
    
    let quiz = await Quiz.findOne();
    
    if (quiz) {
      // Update only the fields that were provided
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
    
    // Create a new quiz if none exists
    quiz = await Quiz.create({
      title,
      description: description || '',
      timeLimit: timeLimit || 0,
      difficulty: difficulty || 'medium'
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

// New function to delete/reset quiz details
export const deleteQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findOne();
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Reset the quiz details to default values
    quiz.title = "Main Quiz"; // Using the default from your schema
    quiz.description = ""; // Empty string as default
    quiz.timeLimit = 0; // 0 as default
    quiz.difficulty = "medium"; // medium as default
    
    await quiz.save();
    
    res.status(200).json({
      success: true,
      message: 'Quiz details reset to default values',
      data: quiz
    });
  } catch (err) {
    console.error('Error deleting quiz details:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};