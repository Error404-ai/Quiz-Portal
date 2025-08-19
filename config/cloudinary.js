import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log('Testing process.env:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.substring(0, 5) + '...',
  api_key: process.env.CLOUDINARY_API_KEY?.substring(0, 5) + '...',
  has_secret: !!process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;