
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'your_folder_name', // optional
    });
    fs.unlinkSync(filePath); // remove file from local after upload
    return result.secure_url; // image URL
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

module.exports = uploadImage;
