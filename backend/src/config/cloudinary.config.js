const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection
if (process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('Cloudinary configured with cloud:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('Cloudinary not configured - using local storage');
}

module.exports = cloudinary;
