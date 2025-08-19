import express from 'express';
import { cloudinaryUploadMiddleware } from '../middleware/cloudinaryUpload.js';
import { handleMulterError } from '../middleware/imageUpload.js';
import { uploadQuizImage, deleteQuizImage } from '../controllers/imageControllers.js';

const router = express.Router();

// Upload image route with proper error handling
router.post('/upload', 
  cloudinaryUploadMiddleware('image'),
  handleMulterError, 
  uploadQuizImage
);

// Delete image route
router.delete('/delete/:publicId', deleteQuizImage);

export default router;