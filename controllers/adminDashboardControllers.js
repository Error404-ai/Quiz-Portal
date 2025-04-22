import mongoose from 'mongoose';
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

export const Questions = async (req, res) => {
  try {
    const { questions, _id } = req.body;
    
    if (!_id) {
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
    
    let quiz = await Quiz.findById(_id);
    
    if (quiz) {
      quiz.questions = [...quiz.questions, ...questions];
      await quiz.save();
      
      return res.status(200).json({
        success: true,
        message: 'Quiz questions updated successfully',
        data: quiz
      });
    }
   
    quiz = await Quiz.create({
      title: req.body.title || "New Quiz",
      questions,
      _id
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

export const updateQuizDetailsAdmin = async (req, res) => {
  try {
    const { title, description, timeLimit, difficulty, _id } = req.body;
    
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
    
    if (timeLimit !== undefined && (isNaN(parseInt(timeLimit)) || parseInt(timeLimit) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Time limit must be a positive number or zero'
      });
    }
    
    let quiz;
    
    if (_id) {
      quiz = await Quiz.findById(_id);
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
      
      quiz.title = title;
      if (description !== undefined) quiz.description = description;
      if (timeLimit !== undefined) quiz.timeLimit = parseInt(timeLimit);
      if (difficulty) quiz.difficulty = difficulty;
      
      if (!quiz.quizId) {
        quiz.quizId = quiz._id.toString();
      }
      
      await quiz.save();
      
      return res.status(200).json({
        success: true,
        message: 'Quiz details updated successfully',
        data: quiz
      });
    } else {
      const uniqueId = new mongoose.Types.ObjectId();
      
      quiz = await Quiz.create({
        title,
        description: description || '',
        timeLimit: timeLimit !== undefined ? parseInt(timeLimit) : 0,
        difficulty: difficulty || 'medium',
        quizId: uniqueId.toString() // Add a unique quizId
      });
      
      return res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        data: quiz
      });
    }
  } catch (err) {
    console.error('Error updating quiz details:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
export const updateQuizStatus = async (req, res) => {
  try {
    const { status, _id } = req.body;
    
    if (!['pending', 'active', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, active, or completed'
      });
    }
    
    let quiz;
    
    if (_id) {
      quiz = await Quiz.findById(_id);
    } else {
      quiz = await Quiz.findOne();
    }
    
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

export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('_id title description timeLimit difficulty status createdAt');
    
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

export const deleteQuizDetails = async (req, res) => {
  try {
    const { _id } = req.query;
    
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }
    
    const deletedQuiz = await Quiz.findByIdAndDelete(_id);
    
    if (!deletedQuiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    await Result.deleteMany({ quiz: deletedQuiz._id });
    
    res.status(200).json({
      success: true,
      message: 'Quiz and related results deleted successfully',
      data: { _id }
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
    const { _id } = req.query;
    let query = {};
    
    if (_id) {
      const quiz = await Quiz.findById(_id);
      if (quiz) {
        query.quiz = quiz._id;
      } else {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
    }
    
    const quizDetails = _id 
      ? await Quiz.findById(_id) 
      : { title: "All Quizzes", questions: [] };
    
    const results = await Result.find(query)
      .populate('user', 'teamName email')
      .sort('-score');
    
    const totalParticipants = results.length;
    const totalPossibleScore = quizDetails.questions.reduce((sum, q) => sum + (q.points || 1), 0) || 0;
    
    let highestScore = 0;
    let lowestScore = totalPossibleScore;
    let totalScore = 0;
    
    const scoreDistribution = {
      '0-50%': 0,
      '51-60%': 0,
      '61-70%': 0,
      '71-80%': 0,
      '81-90%': 0,
      '91-100%': 0
    };
    
    for (const result of results) {
      highestScore = Math.max(highestScore, result.score);
      lowestScore = Math.min(lowestScore, result.score);
      totalScore += result.score;
      
      const percentageScore = totalPossibleScore > 0 
        ? (result.score / totalPossibleScore) * 100 
        : 0;
      
      if (percentageScore <= 50) {
        scoreDistribution['0-50%']++;
      } else if (percentageScore <= 60) {
        scoreDistribution['51-60%']++;
      } else if (percentageScore <= 70) {
        scoreDistribution['61-70%']++;
      } else if (percentageScore <= 80) {
        scoreDistribution['71-80%']++;
      } else if (percentageScore <= 90) {
        scoreDistribution['81-90%']++;
      } else {
        scoreDistribution['91-100%']++;
      }
    }
    
    const averageScore = totalParticipants > 0 ? (totalScore / totalParticipants).toFixed(2) : 0;
    
    let questionStats = [];
    
    if (_id && quizDetails.questions && quizDetails.questions.length > 0) {
      questionStats = quizDetails.questions.map(question => {
        const questionId = question._id;
        const answersForQuestion = results.flatMap(r => 
          r.answers.filter(a => a.questionId.toString() === questionId.toString())
        );
        
        const totalAnswers = answersForQuestion.length;
        const correctAnswers = answersForQuestion.filter(a => a.isCorrect).length;
        const incorrectAnswers = totalAnswers - correctAnswers;
        
        return {
          questionId,
          questionText: question.questionText,
          totalAnswers,
          correctAnswers,
          incorrectAnswers,
          correctPercentage: totalAnswers > 0 ? (correctAnswers / totalAnswers * 100).toFixed(2) : 0
        };
      });
    }

    const teamResults = results.map(result => {
      let timeTaken = 'N/A';
      
      if (result.submittedAt && result.startTime) {
        const startTime = new Date(result.startTime);
        const endTime = new Date(result.submittedAt);
        
        console.log(`Team: ${result.user?.teamName}, StartTime: ${startTime}, SubmitTime: ${endTime}`);
        
        if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
          const durationInMs = endTime - startTime;
          
          if (durationInMs >= 0) { 
            const minutes = Math.floor(durationInMs / 60000);
            const seconds = Math.floor((durationInMs % 60000) / 1000);
            timeTaken = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
          }
        }
      }
      
      return {
        teamName: result.user?.teamName || 'Unknown Team',
        finalScore: totalPossibleScore > 0 
          ? ((result.score / totalPossibleScore) * 100).toFixed(0) + '%' 
          : '0%',
        score: result.score,
        timeTaken
      };
    });
    
    res.status(200).json({
      success: true,
      quizTitle: quizDetails.title,
      stats: {
        totalParticipants,
        highestScore,
        lowestScore,
        averageScore,
        totalPossibleScore
      },
      scoreDistribution,
      questionStats,
      teamResults
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
//delete questions
export const deleteQuizQuestion = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    
    if (!quizId || !questionId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and Question ID are required'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Quiz ID format'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Question ID format'
      });
    }
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    const questionToDelete = quiz.questions.id(questionId);
    
    if (!questionToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this quiz'
      });
    }
    
    questionToDelete.deleteOne();

    await quiz.save();
    
    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      data: {
        quizId,
        questionId,
        remainingQuestionsCount: quiz.questions.length
      }
    });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

//edit the question
export const editQuizQuestion = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const { questionText, options, correctOption, points } = req.body;
    
    if (!quizId || !questionId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and Question ID are required'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Quiz ID format'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Question ID format'
      });
    }
    
    if (!questionText || !options || !Array.isArray(options) || options.length < 2 || 
        typeof correctOption !== 'number' || correctOption < 0 || correctOption >= options.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question format. Please provide questionText, at least 2 options, and a valid correctOption.'
      });
    }
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    const questionToEdit = quiz.questions.id(questionId);
    
    if (!questionToEdit) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this quiz'
      });
    }
    
    questionToEdit.questionText = questionText;
    questionToEdit.options = options;
    questionToEdit.correctOption = correctOption;
    
    if (points !== undefined) {
      questionToEdit.points = points;
    }
    
    await quiz.save();
    
    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: {
        quizId,
        questionId,
        updatedQuestion: questionToEdit
      }
    });
  } catch (err) {
    console.error('Error editing question:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};