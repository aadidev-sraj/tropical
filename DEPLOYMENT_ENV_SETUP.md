# Deployment Environment Variables Setup

## The Problem: ERR_CONNECTION_REFUSED

Your deployed frontend/CMS is trying to connect to `http://localhost:5000`, which doesn't exist in production. You need to configure the correct backend URL.

## Quick Fix

### Step 1: Find Your Backend URL

First, identify where your backend is deployed:
- **Render.com**: `https://your-app-name.onrender.com`
- **Railway**: `https://your-app-name.railway.app`
- **Heroku**: `https://your-app-name.herokuapp.com`
- **VPS/Custom**: `https://api.yourdomain.com`

### Step 2: Create Frontend .env File

Create `frontend/.env` with:

```env
# Replace with your actual backend URL
VITE_API_BASE=https://your-backend-url.com/api

# Examples:
# VITE_API_BASE=https://tropical-backend.onrender.com/api
# VITE_API_BASE=https://tropical-api.railway.app/api
# VITE_API_BASE=https://api.tropicalstore.com/api
```

### Step 3: Create CMS .env File

Create `tropical-cms/.env` with:

```env
# Replace with your actual backend URL (without /api)
VITE_API_URL=https://your-backend-url.com

# Examples:
# VITE_API_URL=https://tropical-backend.onrender.com
# VITE_API_URL=https://tropical-api.railway.app
# VITE_API_URL=https://api.tropicalstore.com
```

### Step 4: Rebuild and Redeploy

After creating the `.env` files:

**For Frontend:**
```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```

**For CMS:**
```bash
cd tropical-cms
npm run build
# Deploy the 'dist' folder
```

## Platform-Specific Instructions

### Netlify / Vercel

If deploying to Netlify or Vercel, set environment variables in their dashboard:

**Netlify:**
1. Go to Site Settings → Build & Deploy → Environment
2. Add variable: `VITE_API_BASE` = `https://your-backend-url.com/api`

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add variable: `VITE_API_BASE` = `https://your-backend-url.com/api`

### Render.com

If deploying to Render:

1. Go to your web service dashboard
2. Click "Environment" tab
3. Add environment variable:
   - Key: `VITE_API_BASE`
   - Value: `https://your-backend-url.com/api`

### Railway

If deploying to Railway:

1. Go to your project
2. Click "Variables" tab
3. Add variable:
   - `VITE_API_BASE` = `https://your-backend-url.com/api`

## Backend Configuration

Your backend also needs CORS configuration to allow requests from your deployed frontend/CMS.

### Update Backend .env

Create/update `backend/.env`:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Server Port
PORT=5000

# CORS Allowed Origins (comma-separated)
CORS_ALLOWED_ORIGINS=https://your-frontend-url.com,https://your-cms-url.com

# Examples:
# CORS_ALLOWED_ORIGINS=https://tropical-store.netlify.app,https://tropical-cms.netlify.app
# CORS_ALLOWED_ORIGINS=https://tropicalstore.com,https://cms.tropicalstore.com

# Upload Directory (for persistent storage)
UPLOADS_DIR=/data/uploads

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production

# Razorpay Keys (if using payments)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## Verification Steps

### 1. Check Browser Console

Open browser DevTools (F12) and check the Console tab:
- Look for the URL being requested
- Should be: `https://your-backend-url.com/uploads/...`
- NOT: `http://localhost:5000/uploads/...`

### 2. Check Network Tab

In DevTools Network tab:
- Filter by "Img" or "XHR"
- Click on a failed request
- Check the "Request URL" - it should point to your deployed backend

### 3. Test Backend Directly

Open your backend URL in browser:
- `https://your-backend-url.com/api/products` should return JSON
- `https://your-backend-url.com/uploads/test.png` should show an image (if exists)

## Common Issues

### Issue 1: Still Getting localhost URLs

**Solution**: Clear browser cache and rebuild:
```bash
# Clear Vite cache
rm -rf node_modules/.vite
rm -rf dist

# Rebuild
npm run build
```

### Issue 2: CORS Error Instead

If you see CORS errors instead of connection refused:
1. Check backend CORS configuration
2. Ensure your frontend URL is in `CORS_ALLOWED_ORIGINS`
3. Restart backend after updating .env

### Issue 3: Images Still Not Loading

1. Check if backend `/uploads` folder exists and has images
2. Verify backend serves static files: `app.use('/uploads', express.static(...))`
3. Check file permissions on uploads folder
4. Consider using cloud storage (S3, Cloudinary) for production

## Testing Locally First

Before deploying, test with your deployed backend URL locally:

1. Update `frontend/.env`:
   ```env
   VITE_API_BASE=https://your-deployed-backend.com/api
   ```

2. Run frontend locally:
   ```bash
   cd frontend
   npm run dev
   ```

3. Check if images load from deployed backend

## Need Help?

If images still don't load after following these steps:

1. **Check backend logs** - Is it receiving requests?
2. **Check backend health** - Is it running? Visit the URL in browser
3. **Check uploads folder** - Does it have the image files?
4. **Check database** - Are image paths stored correctly as `/uploads/...`?

## Summary Checklist

- [ ] Created `frontend/.env` with `VITE_API_BASE`
- [ ] Created `tropical-cms/.env` with `VITE_API_URL`
- [ ] Updated `backend/.env` with `CORS_ALLOWED_ORIGINS`
- [ ] Rebuilt frontend: `npm run build`
- [ ] Rebuilt CMS: `npm run build`
- [ ] Redeployed all applications
- [ ] Tested image loading in browser
- [ ] Checked browser console for errors
- [ ] Verified backend is accessible

## Example Complete Setup

**Backend URL**: `https://tropical-api.onrender.com`
**Frontend URL**: `https://tropical-store.netlify.app`
**CMS URL**: `https://tropical-cms.netlify.app`

**frontend/.env**:
```env
VITE_API_BASE=https://tropical-api.onrender.com/api
```

**tropical-cms/.env**:
```env
VITE_API_URL=https://tropical-api.onrender.com
```

**backend/.env**:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tropical
PORT=5000
CORS_ALLOWED_ORIGINS=https://tropical-store.netlify.app,https://tropical-cms.netlify.app
UPLOADS_DIR=/data/uploads
JWT_SECRET=super-secret-key-change-this
```

After setting these up and redeploying, images should load correctly!
