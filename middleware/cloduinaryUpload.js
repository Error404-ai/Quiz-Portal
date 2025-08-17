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
    // First use multer to handle the file upload to local storage
    upload.single(fieldName),
    
    // Then process with Cloudinary
    async (req, res, next) => {
      try {
        // If no file was uploaded, continue
        if (!req.file) {
          return next();
        }

        // Upload file to Cloudinary
        const imageUrl = await uploadToCloudinary(req.file.path);
        
        // Add the Cloudinary URL to the request object
        req.cloudinaryUrl = imageUrl;
        
        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: `Error uploading image: ${error.message}`
        });
      }
    }
  ];
};