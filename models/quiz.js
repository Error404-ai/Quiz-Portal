import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  timeLimit: {
    type: Number,
    default: 0 // in minutes, 0 means no time limit
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
  quizId: {
    type: String,
    unique: true,
    default: function () {
      return `quiz-${this._id}`; // Generate a quizId based on _id
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
export default mongoose.model('Quiz', QuizSchema);