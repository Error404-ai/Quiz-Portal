import cloudinary from '../config/cloudinary.js';

/**
 * Upload image to Cloudinary from memory buffer
 * @param {Buffer} buffer - File buffer from multer
 * @param {object} options - Cloudinary upload options
 * @returns {string} - Cloudinary secure URL
 */
export const uploadToCloudinary = async (buffer, options = {}) => {
  try {
    // Validate input
    if (!buffer) {
      throw new Error('No file buffer provided');
    }

    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Invalid buffer provided');
    }

    if (buffer.length === 0) {
      throw new Error('Empty file buffer');
    }

    console.log('Starting Cloudinary upload...', {
      bufferSize: buffer.length,
      hasCloudinary: !!cloudinary,
      hasUploader: !!cloudinary?.uploader
    });

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'quiz-images',
          resource_type: 'auto',
          transformation: [
            { quality: 'auto:best' },
            { fetch_format: 'auto' }
          ],
          ...options
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', {
              message: error.message,
              error: error,
              http_code: error.http_code,
              api_error_code: error.api_error_code
            });
            reject(new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`));
          } else if (!result) {
            console.error('Cloudinary Upload Error: No result returned');
            reject(new Error('Cloudinary upload failed: No result returned'));
          } else if (!result.secure_url) {
            console.error('Cloudinary Upload Error: No secure URL in result', result);
            reject(new Error('Cloudinary upload failed: No secure URL returned'));
          } else {
            console.log('Cloudinary upload successful:', {
              secure_url: result.secure_url,
              public_id: result.public_id,
              bytes: result.bytes
            });
            resolve(result.secure_url);
          }
        }
      );
      
      // Handle stream errors
      uploadStream.on('error', (streamError) => {
        console.error('Upload stream error:', streamError);
        reject(new Error(`Upload stream error: ${streamError.message}`));
      });
      
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary Upload Error (outer catch):', error);
    throw new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {object} - Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    console.log('Deleting from Cloudinary:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
    return result;
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    throw new Error(`Cloudinary delete failed: ${error.message || 'Unknown error'}`);
  }
};