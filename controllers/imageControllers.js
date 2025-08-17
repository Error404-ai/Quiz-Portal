const uploadImage = require('../utils/uploadImage');

export const uploadQuizImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Upload to Cloudinary and get secure URL
    const imageUrl = await uploadImage(req.file.path);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl // This will be the full Cloudinary URL
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
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
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