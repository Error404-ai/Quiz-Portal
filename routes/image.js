import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import { upload, handleMulterError } from '../middleware/imageUpload.js';
import { uploadQuizImage, deleteQuizImage } from '../controllers/imageControllers.js';

const router = express.Router();

router.post('/upload', protectAdmin, upload.single('image'), handleMulterError, uploadQuizImage);

router.delete('/:filename', protectAdmin, deleteQuizImage);

export default router;