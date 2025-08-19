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

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/images', imageRoutes);
// Add this temporary test endpoint to your index.js file (after your other routes)

app.get('/api/test-cloudinary', async (req, res) => {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Import cloudinary here to test
    const cloudinary = (await import('./config/cloudinary.js')).default;
    
    // Create a simple 1x1 pixel PNG buffer
    const testBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8E, 0x8B, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    console.log('Created test buffer, size:', testBuffer.length);
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'test-images',
          resource_type: 'auto'
        },
        (error, result) => {
          console.log('Cloudinary callback - Error:', !!error, 'Result:', !!result);
          
          if (error) {
            console.error('Detailed upload error:', {
              message: error.message,
              name: error.name,
              http_code: error.http_code,
              api_error_code: error.api_error_code,
              stack: error.stack,
              fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
            });
            reject(error);
          } else if (!result) {
            reject(new Error('No result returned from Cloudinary'));
          } else {
            console.log('Upload successful:', {
              secure_url: result.secure_url,
              public_id: result.public_id,
              bytes: result.bytes
            });
            resolve(result);
          }
        }
      );
      
      uploadStream.on('error', (streamError) => {
        console.error('Stream error:', streamError);
        reject(streamError);
      });
      
      console.log('Starting upload stream...');
      uploadStream.end(testBuffer);
    });
    
    // Clean up test image
    await cloudinary.uploader.destroy(result.public_id);
    
    res.json({
      success: true,
      message: 'Cloudinary test successful',
      url: result.secure_url
    });
    
  } catch (error) {
    console.error('Test endpoint error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: `Cloudinary test failed: ${error.message}`,
      error: error.name
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
