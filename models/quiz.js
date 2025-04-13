import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctOption: {
    type: Number,
    required: true
  },
  points: {
    type: Number,
    default: 1
  }
});

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "Main Quiz",
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  timeLimit: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  },
  questions: [QuestionSchema],
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Quiz', QuizSchema);