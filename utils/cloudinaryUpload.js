import cloudinary from '../config/cloudinary.js';

/**
 * Upload image to Cloudinary from memory buffer
 * @param {Buffer} buffer - File buffer from multer
 * @param {object} options - Cloudinary upload options
 * @returns {string} - Cloudinary secure URL
 */
export const uploadToCloudinary = async (buffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'quiz-images',
          resource_type: 'auto',
          ...options
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            resolve(result.secure_url);
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  } catch (error) {
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