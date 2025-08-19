import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the local file
 * @param {object} options - Cloudinary upload options
 * @returns {string} - Cloudinary secure URL
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'quiz-images', // organized folder structure
      resource_type: 'auto',
      ...options
    });
    
    // Clean up local file after successful upload
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.warn('Could not delete local file:', unlinkError.message);
    }
    
    return result.secure_url;
  } catch (error) {
    // Clean up local file on error
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.warn('Could not delete local file after error:', unlinkError.message);
    }
    
    console.error('Cloudinary Upload Error:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {object} - Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};