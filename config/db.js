import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    const collections = await conn.connection.db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));
    
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
};

const updateAllQuizzes = async () => {
  try {
    const conn = await connectDB();
        const result = await Quiz.updateMany(
      {}, 
      { $set: { status: 'active' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} quizzes to 'active' status`);
    
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