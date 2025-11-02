const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary.config');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Determine storage type from environment
const storageType = process.env.STORAGE_TYPE || 'local';

// Configure storage based on type
let storage;

if (storageType === 'cloudinary' && process.env.CLOUDINARY_CLOUD_NAME) {
  // Use Cloudinary for persistent storage (production)
  console.log('Using Cloudinary storage');
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'tropical', // Folder name in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 2000, height: 2000, crop: 'limit' }], // Max dimensions
    },
  });
} else {
  // Use local disk storage (development)
  console.log('Using local disk storage');
  const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      // Generate unique filename: timestamp-randomstring-originalname
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
    }
  });
}

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
