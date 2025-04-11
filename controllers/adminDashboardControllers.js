
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

// 4. Control Quiz Status (Start/End)
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
    
    // Update quiz status
    quiz.status = status;
    
    // Set start/end time based on status
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

// Get current quiz status and questions
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