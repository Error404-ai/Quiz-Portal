import { upload } from './imageUpload.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

/**
 * Middleware to handle image upload to Cloudinary
 * Uses multer for initial file handling, then uploads to Cloudinary
 * 
 * @param {string} fieldName - Form field name for the image
 * @returns {Function} Express middleware
 */
export const cloudinaryUploadMiddleware = (fieldName) => {
  return [
    // First use multer to handle the file upload to memory
    upload.single(fieldName),
    
    // Then process with Cloudinary
    async (req, res, next) => {
      try {
        // If no file was uploaded, continue
        if (!req.file) {
          console.log('No file uploaded in request');
          return next();
        }

        console.log('File received by multer:', {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          hasBuffer: !!req.file.buffer,
          bufferLength: req.file.buffer?.length
        });

        // Validate file buffer
        if (!req.file.buffer) {
          throw new Error('File buffer is missing');
        }

        if (req.file.buffer.length === 0) {
          throw new Error('File buffer is empty');
        }
        
        // Upload file buffer to Cloudinary
        const imageUrl = await uploadToCloudinary(req.file.buffer);
        
        console.log('Cloudinary upload success:', imageUrl);
        
        // Add the Cloudinary URL to the request object
        req.cloudinaryUrl = imageUrl;
        
        next();
      } catch (error) {
        console.error('Cloudinary middleware error:', {
          message: error.message,
          stack: error.stack,
          file: req.file ? {
            name: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
          } : 'No file'
        });
        
        return res.status(500).json({
          success: false,
          message: `Error uploading image: ${typeof error === 'string' ? error : error.message || error.toString() || 'Unknown error occurred'}`
        });
      }
    }
  ];
};