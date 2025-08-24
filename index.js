import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import adminDashboardRoutes from './routes/adminDashboard.js';
import quizRoutes from './routes/quiz.js';
import imageRoutes from './routes/upload.js';
import rateLimit from 'express-rate-limit';
import timeout from 'connect-timeout';

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Rate limiting: 100 requests / 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { 
    success: false,
    message: 'Too many requests, please try again later.' 
  }
});
app.use(limiter);

// ✅ Request timeout: 10 seconds
app.use(timeout('10s'));

// Middleware setup
app.use(cors({
  origin: ['http://localhost:5173', 'https://quizze-portal.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/images', imageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ Handle request timeouts gracefully
app.use((req, res, next) => {
  if (!req.timedout) next();
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(503).json({
    success: false,
    message: 'Service temporarily unavailable. Please try again later.'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
