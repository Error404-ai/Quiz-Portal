import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Debug logging
console.log('=== Cloudinary Configuration Debug ===');
console.log('Environment variables check:');
console.log('CLOUDINARY_CLOUD_NAME exists:', !!process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY exists:', !!process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET exists:', !!process.env.CLOUDINARY_API_SECRET);

if (process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('CLOUDINARY_CLOUD_NAME length:', process.env.CLOUDINARY_CLOUD_NAME.length);
}
if (process.env.CLOUDINARY_API_KEY) {
  console.log('CLOUDINARY_API_KEY length:', process.env.CLOUDINARY_API_KEY.length);
}
if (process.env.CLOUDINARY_API_SECRET) {
  console.log('CLOUDINARY_API_SECRET length:', process.env.CLOUDINARY_API_SECRET.length);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test configuration
try {
  const config = cloudinary.config();
  console.log('Cloudinary config loaded successfully');
  console.log('Config cloud_name:', !!config.cloud_name);
  console.log('Config api_key:', !!config.api_key);
  console.log('Config api_secret:', !!config.api_secret);
} catch (error) {
  console.error('Cloudinary config error:', error);
}

console.log('=== End Cloudinary Debug ===\n');

export default cloudinary;