import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import adminDashboardRoutes from './routes/adminDashboard.js';
import quizRoutes from './routes/quiz.js';

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


app.use('/api/admin', adminRoutes);

// Use the routes
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/quiz', quizRoutes);