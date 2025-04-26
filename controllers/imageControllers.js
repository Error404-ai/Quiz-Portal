import path from 'path';
import fs from 'fs';

export const uploadQuizImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const protocol = req.secure ? 'https' : 'http';
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/quiz-images/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl
      }
    });
  } catch (err) {
    console.error('Error uploading image:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const deleteQuizImage = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }
    
    const filePath = path.join('uploads/quiz-images', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      
      return res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
  } catch (err) {
    console.error('Error deleting image:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};