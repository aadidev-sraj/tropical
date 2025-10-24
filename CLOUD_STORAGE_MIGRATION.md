# Cloud Storage Migration Guide

## Problem
Images uploaded to the backend's local `/uploads` folder are lost when:
- Server restarts (serverless platforms)
- Container is redeployed
- Server is scaled/moved

## Solution: Use Cloud Storage

### Option A: Cloudinary (Easiest, Free Tier Available)

#### 1. Install Cloudinary
```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

#### 2. Get Cloudinary Credentials
1. Sign up at https://cloudinary.com (free tier: 25GB storage, 25GB bandwidth/month)
2. Get your credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

#### 3. Update Backend .env
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 4. Update Upload Middleware

**File**: `backend/src/middleware/upload.middleware.js`

```javascript
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tropical-uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 2000, height: 2000, crop: 'limit' }] // Optional: resize large images
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
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
```

#### 5. Update Upload Routes

**File**: `backend/src/routes/upload.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Upload single image (admin only)
router.post('/single', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Cloudinary returns the full URL
  const imageUrl = req.file.path; // This is the Cloudinary URL
  res.json({
    message: 'File uploaded successfully',
    data: { url: imageUrl },
    url: imageUrl,
    filename: req.file.filename
  });
});

// Upload customization image (authenticated users)
router.post('/customization', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  const imageUrl = req.file.path;
  res.json({
    message: 'Customization image uploaded successfully',
    data: { url: imageUrl },
    url: imageUrl,
    filename: req.file.filename
  });
});

// Upload multiple images
router.post('/multiple', protect, adminOnly, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  
  const imageUrls = req.files.map(file => file.path);
  res.json({
    message: 'Files uploaded successfully',
    urls: imageUrls,
    count: req.files.length
  });
});

// Delete an image (admin only)
router.delete('/:publicId', protect, adminOnly, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const cloudinary = require('cloudinary').v2;
    await cloudinary.uploader.destroy(publicId);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

module.exports = router;
```

#### 6. Update Frontend/CMS toImageUrl

Since Cloudinary returns full URLs, update the utility:

**File**: `frontend/src/lib/api.ts` and `tropical-cms/src/utils/api.js`

```javascript
export function toImageUrl(u) {
  if (!u) return undefined;
  // If already a full URL (Cloudinary), return as-is
  if (/^https?:\/\//i.test(u)) return u;
  // Otherwise, construct from API base
  const origin = API_BASE.replace(/\/api\/?$/, '');
  return u.startsWith('/') ? origin + u : origin + '/' + u;
}
```

#### 7. Remove Static File Serving (Optional)

Since images are now on Cloudinary, you can remove this from `server.js`:
```javascript
// Remove or comment out:
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

---

### Option B: AWS S3

#### 1. Install AWS SDK
```bash
cd backend
npm install aws-sdk multer-s3
```

#### 2. Get AWS Credentials
1. Create AWS account
2. Create S3 bucket
3. Create IAM user with S3 access
4. Get Access Key ID and Secret Access Key

#### 3. Update Backend .env
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=tropical-uploads
```

#### 4. Update Upload Middleware

```javascript
const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

// Configure AWS
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new aws.S3();

// Configure S3 storage
const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET,
  acl: 'public-read',
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'uploads/' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

module.exports = upload;
```

---

### Option C: Persistent Volume (VPS/Docker Only)

If deploying to a VPS or using Docker with volume mounts:

#### 1. Create Persistent Directory
```bash
mkdir -p /data/uploads
chmod 755 /data/uploads
```

#### 2. Update Backend .env
```env
UPLOADS_DIR=/data/uploads
```

#### 3. Mount Volume (Docker)
```yaml
# docker-compose.yml
services:
  backend:
    volumes:
      - /data/uploads:/app/uploads
```

---

## Migration Steps for Existing Data

### If Using Cloudinary/S3:

1. **Backup existing uploads folder**
   ```bash
   zip -r uploads-backup.zip backend/uploads/
   ```

2. **Deploy new code with cloud storage**

3. **Re-upload images via CMS**
   - Go to deployed CMS
   - Edit each product/design
   - Re-upload images
   - Images will now go to Cloudinary/S3

4. **Update database** (if needed)
   - Old URLs: `/uploads/image.png`
   - New URLs: `https://res.cloudinary.com/...`

---

## Recommended Solution

**For your use case, I recommend Cloudinary because:**

✅ Free tier is generous (25GB storage)
✅ Easiest to implement
✅ Automatic image optimization
✅ Built-in CDN for fast delivery
✅ No server maintenance needed
✅ Works with any hosting platform

---

## Quick Start with Cloudinary

1. Sign up: https://cloudinary.com
2. Get credentials from dashboard
3. Run these commands:

```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

4. Add to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. Replace `backend/src/middleware/upload.middleware.js` with the Cloudinary version above

6. Redeploy backend

7. Re-upload images via CMS

Done! Images will now persist forever and load fast from Cloudinary's CDN.
