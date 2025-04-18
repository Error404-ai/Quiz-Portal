export const getQuizResults = async (req, res) => {
  try {
    const { _id } = req.query;
    let query = {};
    
    if (_id) {
      const quiz = await Quiz.findById(_id);
      if (quiz) {
        query.quiz = quiz._id;
      }
    }
    
    const results = await Result.find(query)
      .populate('userId', 'teamName email')
      .sort('-score');
    
    const resultsWithAttemptedCount = results.map(result => {
      return {
        ...result._doc,
        attemptedCount: result.attemptedQuestions ? result.attemptedQuestions.length : 0
      };
    });
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: resultsWithAttemptedCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};