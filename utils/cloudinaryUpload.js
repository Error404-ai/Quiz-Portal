import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

/**
 * Uploads an image to Cloudinary
 * @param {string} filePath - Path to the image file
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - Returns the secure URL of the uploaded image
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    // Set default options
    const uploadOptions = {
      folder: 'quiz-app',
      resource_type: 'image',
      ...options
    };

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
    // Remove the file from local storage after successful upload
    fs.unlinkSync(filePath);
    
    // Return the secure URL
    return result.secure_url;
  } catch (error) {
    // If there's an error and the file exists, clean it up
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    console.error('Cloudinary Upload Error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};