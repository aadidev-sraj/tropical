# Cloudinary Setup for Persistent Image Storage

## Problem: Images Disappearing on Render

### Why This Happens
Render's free tier uses **ephemeral storage**. This means:
- ✅ Images upload successfully
- ✅ Images work immediately after upload
- ❌ Images disappear when server restarts (every ~15 minutes of inactivity)
- ❌ Images disappear on new deployments

### Solution: Use Cloudinary (Free Tier)
Cloudinary provides:
- ✅ 25GB storage (free)
- ✅ 25GB bandwidth/month (free)
- ✅ Persistent storage (images never disappear)
- ✅ CDN delivery (faster loading)
- ✅ Image transformations (resize, optimize)

## Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register_free
2. Sign up (free account)
3. After signup, go to Dashboard
4. Copy these values:
   - **Cloud Name**: e.g., `dxxxxx`
   - **API Key**: e.g., `123456789012345`
   - **API Secret**: e.g., `abcdefghijklmnopqrstuvwxyz`

## Step 2: Install Cloudinary Package

```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

## Step 3: Update Environment Variables

Add to `backend/.env`:
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Set to 'cloudinary' to use cloud storage, 'local' for local dev
STORAGE_TYPE=cloudinary
```

For **Render deployment**, add these as environment variables in the Render dashboard.

## Step 4: Create Cloudinary Configuration

Create `backend/src/config/cloudinary.config.js`:

\`\`\`javascript
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
\`\`\`

## Step 5: Update Upload Middleware

The upload middleware needs to support both local and Cloudinary storage.

See the updated `backend/src/middleware/upload.middleware.js` file.

## Step 6: Update Upload Routes

The upload routes need to handle Cloudinary URLs.

See the updated `backend/src/routes/upload.routes.js` file.

## Step 7: Test Locally (Optional)

For local development, you can still use local storage:
```env
STORAGE_TYPE=local
```

For production (Render), use:
```env
STORAGE_TYPE=cloudinary
```

## Step 8: Deploy to Render

1. Go to Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add environment variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `STORAGE_TYPE=cloudinary`
5. Save and redeploy

## How It Works

### Local Storage (Development)
```
Upload → backend/uploads/ folder → Served via /uploads route
```

### Cloudinary (Production)
```
Upload → Cloudinary CDN → Returns URL like:
https://res.cloudinary.com/your-cloud/image/upload/v123456/filename.jpg
```

### Frontend/CMS
No changes needed! The `toImageUrl()` function already handles both:
- Relative paths: `/uploads/image.jpg`
- Absolute URLs: `https://res.cloudinary.com/...`

## Migration: Moving Existing Images

If you have images in the database with local paths, they'll need to be re-uploaded through the CMS.

### Option 1: Re-upload via CMS (Recommended)
1. Go to each section (Hero, Products, Featured)
2. Re-upload the images
3. Save

### Option 2: Bulk Migration Script
Create a script to upload existing images to Cloudinary (if you have many).

## Verification

### Test Upload
1. Upload an image via CMS
2. Check the database - URL should be Cloudinary URL
3. Restart the backend server
4. Image should still be visible ✅

### Check Cloudinary Dashboard
1. Go to Cloudinary dashboard
2. Click "Media Library"
3. You should see your uploaded images

## Troubleshooting

### Issue: Images still using local paths
**Solution**: Check `STORAGE_TYPE` environment variable is set to `cloudinary`

### Issue: Upload fails with "Invalid credentials"
**Solution**: Verify Cloudinary credentials in environment variables

### Issue: Images upload but don't display
**Solution**: 
- Check browser console for CORS errors
- Verify Cloudinary URLs are being returned correctly
- Check `toImageUrl()` function handles Cloudinary URLs

### Issue: Want to delete old images
**Solution**: 
- Cloudinary dashboard → Media Library → Select and delete
- Or use Cloudinary API to delete programmatically

## Cost Considerations

### Cloudinary Free Tier Limits
- 25GB storage
- 25GB bandwidth/month
- 25 credits/month (transformations)

### When You Might Need Paid Plan
- If you exceed 25GB storage
- If you exceed 25GB bandwidth/month
- For high-traffic sites

### Alternative: AWS S3
If you prefer AWS:
- Use `multer-s3` package
- Similar setup process
- Free tier: 5GB storage, 20,000 GET requests

## Summary

✅ **Before**: Images stored locally → Disappear on restart
✅ **After**: Images stored on Cloudinary → Persist forever
✅ **No frontend changes needed**
✅ **Free for most use cases**
✅ **Better performance with CDN**

## Files to Update

1. ✅ `backend/src/config/cloudinary.config.js` (new)
2. ✅ `backend/src/middleware/upload.middleware.js` (update)
3. ✅ `backend/src/routes/upload.routes.js` (update)
4. ✅ `backend/.env` (add Cloudinary credentials)
5. ✅ Render environment variables (add Cloudinary credentials)
