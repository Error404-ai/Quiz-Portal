import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    selectedOption: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  attemptedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz.questions'
  }],
  score: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Result', ResultSchema);