import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from './models/quiz.js';

dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

// Update all quizzes to active status
const updateAllQuizzes = async () => {
  try {
    const conn = await connectDB();
    
    // Update all quizzes to active status
    const result = await Quiz.updateMany(
      {}, // Empty filter to match all documents
      { $set: { status: 'active' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} quizzes to 'active' status`);
    
    // Optional: List all quizzes and their statuses
    const quizzes = await Quiz.find().select('title status');
    console.log('Current quizzes:');
    quizzes.forEach(quiz => {
      console.log(`- ${quiz.title}: ${quiz.status}`);
    });
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (err) {
    console.error(`Error updating quizzes: ${err.message}`);
  }
};

updateAllQuizzes();