# Quick Fix: Image Persistence Issue

## Problem
Images are uploading successfully but disappearing after a while because Render uses ephemeral storage (files are deleted on server restart).

## Solution: Use Cloudinary (Free)

### Step 1: Install Dependencies
```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

### Step 2: Create Cloudinary Account
1. Go to https://cloudinary.com/users/register_free
2. Sign up (free)
3. Go to Dashboard and copy:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Update Environment Variables

**For Local Development** (backend/.env):
```env
STORAGE_TYPE=local
```

**For Production/Render** (Render Dashboard → Environment):
```env
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Step 4: Deploy to Render
1. Push code to GitHub
2. Render will auto-deploy
3. Or manually trigger deploy in Render dashboard

### Step 5: Test
1. Upload an image via CMS
2. Wait 5 minutes
3. Refresh page
4. Image should still be visible ✅

## What Changed

### Files Modified
- ✅ `backend/package.json` - Added Cloudinary dependencies
- ✅ `backend/src/config/cloudinary.config.js` - New Cloudinary config
- ✅ `backend/src/middleware/upload.middleware.js` - Supports both local and Cloudinary
- ✅ `backend/src/routes/upload.routes.js` - Returns correct URLs for both storage types
- ✅ `backend/.env.example` - Added Cloudinary variables

### How It Works

**Development (Local)**:
```
Upload → backend/uploads/ folder → /uploads/image.jpg
```

**Production (Cloudinary)**:
```
Upload → Cloudinary CDN → https://res.cloudinary.com/.../image.jpg
```

### Frontend/CMS Changes
**None needed!** The `toImageUrl()` function already handles both URL formats.

## Verification

### Check Storage Type
When backend starts, you'll see:
```
Using Cloudinary storage  ← Production
OR
Using local disk storage   ← Development
```

### Check Upload
After uploading, backend logs:
```
Image uploaded: https://res.cloudinary.com/...  ← Cloudinary
OR
Image uploaded: /uploads/image-123.jpg          ← Local
```

### Check Database
Images in database will have:
- **Cloudinary**: Full URL `https://res.cloudinary.com/...`
- **Local**: Relative path `/uploads/...`

## Troubleshooting

### Images still disappearing
- Check `STORAGE_TYPE=cloudinary` in Render environment variables
- Check Cloudinary credentials are correct
- Check backend logs for "Using Cloudinary storage"

### Upload fails
- Verify Cloudinary credentials
- Check Cloudinary dashboard for errors
- Check backend logs for error messages

### Old images not working
- Re-upload images through CMS
- Old local paths won't work after switching to Cloudinary

## Cost
- **Free tier**: 25GB storage, 25GB bandwidth/month
- **Plenty for most sites**
- Upgrade only if you exceed limits

## Alternative: Keep Local Storage
If you want to keep using local storage on Render:
1. Use Render's Persistent Disk (paid feature)
2. Set `UPLOADS_DIR=/mnt/data/uploads` in environment
3. Mount persistent disk to `/mnt/data`

But Cloudinary is **free and easier**!
