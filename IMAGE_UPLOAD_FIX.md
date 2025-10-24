# Image Upload Fix for Deployed Environment

## Problem
Uploaded images were not appearing in the deployed CMS and frontend because:
1. CMS was storing absolute URLs (e.g., `http://localhost:5000/uploads/...`) instead of relative paths
2. CMS wasn't using the `toImageUrl` utility to convert relative paths to absolute URLs
3. Images stored in local `uploads` folder may not persist in serverless deployments

## Solution Applied

### 1. Added `toImageUrl` Utility to CMS
**File**: `tropical-cms/src/utils/api.js`

Added a utility function to convert relative image paths to absolute URLs:
```javascript
export function toImageUrl(u) {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return u.startsWith('/') ? API_URL + u : API_URL + '/' + u;
}
```

### 2. Updated All CMS Pages
Modified the following files to:
- Import and use `toImageUrl` for displaying images
- Store relative paths (e.g., `/uploads/image.png`) instead of absolute URLs

**Files Updated**:
- `tropical-cms/src/pages/Designs.jsx`
- `tropical-cms/src/pages/Products.jsx`
- `tropical-cms/src/pages/Featured.jsx`
- `tropical-cms/src/pages/Hero.jsx`

**Changes Made**:
- Import: `import { uploadAPI, toImageUrl } from '../utils/api';`
- Upload: Store `response.data.url` (relative path) instead of `${API_URL}${response.data.url}`
- Display: Use `<img src={toImageUrl(imageUrl)} />` instead of `<img src={imageUrl} />`

### 3. Frontend Already Correct
The frontend (`frontend/src/lib/api.ts`) already has the `toImageUrl` utility and uses it correctly.

## How It Works

### Development
- Backend runs on `http://localhost:5000`
- CMS runs on `http://localhost:3000`
- Frontend runs on `http://localhost:5173`
- Images stored as `/uploads/filename.png` in database
- `toImageUrl` converts to `http://localhost:5000/uploads/filename.png`

### Production
- Backend runs on your deployed API URL (e.g., `https://api.yourdomain.com`)
- CMS uses `VITE_API_URL` environment variable
- Frontend uses `VITE_API_BASE` environment variable
- Images stored as `/uploads/filename.png` in database
- `toImageUrl` converts to `https://api.yourdomain.com/uploads/filename.png`

## Deployment Requirements

### 1. Environment Variables

**Backend** (`.env`):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
UPLOADS_DIR=/data/uploads  # Optional: for persistent storage
```

**CMS** (`.env`):
```env
VITE_API_URL=https://api.yourdomain.com
```

**Frontend** (`.env`):
```env
VITE_API_BASE=https://api.yourdomain.com/api
```

### 2. Persistent Storage for Images

⚠️ **IMPORTANT**: In serverless/container deployments, the local `uploads` folder is ephemeral and will be lost on restart.

**Options**:

#### Option A: Use Persistent Volume (Recommended for VPS/Docker)
- Mount a persistent volume to `/data/uploads`
- Set `UPLOADS_DIR=/data/uploads` in backend `.env`
- Ensure the directory has write permissions

#### Option B: Use Cloud Storage (Recommended for Serverless)
Consider migrating to cloud storage services:
- **AWS S3**: Use `multer-s3` package
- **Cloudinary**: Use `cloudinary` package
- **Google Cloud Storage**: Use `@google-cloud/storage`
- **Azure Blob Storage**: Use `@azure/storage-blob`

Example with Cloudinary:
```javascript
// backend/src/middleware/upload.middleware.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tropical-uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
});
```

### 3. Backend Static File Serving

Ensure your backend serves the uploads folder:
```javascript
// backend/src/server.js
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

### 4. CORS Configuration

Ensure CORS allows your frontend and CMS domains:
```javascript
// backend/src/server.js
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://yourdomain.com',
    'https://cms.yourdomain.com'
  ],
  credentials: true
};
```

## Testing

### 1. Test Image Upload in CMS
1. Login to CMS
2. Go to Products/Designs/Hero/Featured
3. Upload an image
4. Verify image appears in the preview
5. Check browser DevTools Network tab - image should load from correct URL

### 2. Test Image Display in Frontend
1. Open frontend
2. Navigate to products/customization pages
3. Verify all images load correctly
4. Check browser console for any 404 errors

### 3. Verify Database
Check MongoDB to ensure images are stored as relative paths:
```javascript
// Should be: "/uploads/image-123456.png"
// NOT: "http://localhost:5000/uploads/image-123456.png"
```

## Migration for Existing Data

If you have existing data with absolute URLs, run this migration:

```javascript
// migration-script.js
const mongoose = require('mongoose');

async function migrateImageUrls() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Update Products
  const Product = require('./src/models/product.model');
  const products = await Product.find({});
  for (const product of products) {
    product.images = product.images.map(img => 
      img.replace(/^https?:\/\/[^\/]+/, '')
    );
    await product.save();
  }
  
  // Update Designs
  const Design = require('./src/models/design.model');
  const designs = await Design.find({});
  for (const design of designs) {
    design.imageUrl = design.imageUrl.replace(/^https?:\/\/[^\/]+/, '');
    await design.save();
  }
  
  // Update Hero sections
  const Hero = require('./src/models/hero.model');
  const heroes = await Hero.find({});
  for (const hero of heroes) {
    hero.backgroundImage = hero.backgroundImage.replace(/^https?:\/\/[^\/]+/, '');
    await hero.save();
  }
  
  // Update Featured items
  const Featured = require('./src/models/featured.model');
  const featured = await Featured.find({});
  for (const item of featured) {
    item.images = item.images.map(img => 
      img.replace(/^https?:\/\/[^\/]+/, '')
    );
    await item.save();
  }
  
  console.log('Migration complete!');
  process.exit(0);
}

migrateImageUrls().catch(console.error);
```

## Summary

✅ **Fixed**:
- CMS now stores relative paths instead of absolute URLs
- CMS uses `toImageUrl` utility for consistent image URL handling
- Images will work correctly in any deployed environment

⚠️ **Action Required**:
1. Set correct `VITE_API_URL` and `VITE_API_BASE` environment variables
2. Ensure backend has persistent storage for uploads folder
3. Run migration script if you have existing data with absolute URLs
4. Consider migrating to cloud storage for production deployments

## Next Steps

1. **Immediate**: Deploy the updated code
2. **Short-term**: Test all image uploads and displays
3. **Long-term**: Consider migrating to cloud storage (S3, Cloudinary, etc.)
