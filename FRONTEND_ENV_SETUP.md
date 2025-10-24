# Frontend Environment Setup for Render

## The Problem
Your frontend is using `http://localhost:5000/api` instead of your Render backend URL.

## Solution

### Step 1: Create Frontend .env File

Create a file: `frontend/.env`

**Replace `YOUR_RENDER_BACKEND_URL` with your actual Render URL:**

```env
# Backend API Base URL - REPLACE WITH YOUR RENDER URL
VITE_API_BASE=https://YOUR_RENDER_BACKEND_URL.onrender.com/api

# Example:
# VITE_API_BASE=https://tropical-backend.onrender.com/api
# VITE_API_BASE=https://tropical-api-xyz123.onrender.com/api
```

### Step 2: Find Your Render Backend URL

1. Go to https://dashboard.render.com
2. Click on your backend service
3. Copy the URL at the top (e.g., `https://your-app.onrender.com`)
4. Add `/api` at the end

### Step 3: Create the File

**Option A: Manual Creation**
1. Open `frontend` folder
2. Create new file named `.env` (starts with a dot)
3. Paste the content above with your actual URL

**Option B: Using Command Line**
```bash
cd frontend
echo "VITE_API_BASE=https://YOUR_RENDER_BACKEND_URL.onrender.com/api" > .env
```

### Step 4: Rebuild Frontend

After creating `.env`:

```bash
cd frontend
npm run build
```

### Step 5: Deploy Updated Frontend

Deploy the new `dist` folder to your hosting platform (Netlify/Vercel/etc.)

## For CMS Too

Also create `tropical-cms/.env`:

```env
# Backend API URL (without /api)
VITE_API_URL=https://YOUR_RENDER_BACKEND_URL.onrender.com

# Example:
# VITE_API_URL=https://tropical-backend.onrender.com
```

Then rebuild:
```bash
cd tropical-cms
npm run build
```

## Alternative: Set in Hosting Platform

If deploying to Netlify/Vercel, set environment variables there instead:

### Netlify
1. Site Settings → Build & Deploy → Environment
2. Add variable:
   - Key: `VITE_API_BASE`
   - Value: `https://YOUR_RENDER_BACKEND_URL.onrender.com/api`
3. Trigger redeploy

### Vercel
1. Project Settings → Environment Variables
2. Add variable:
   - Key: `VITE_API_BASE`
   - Value: `https://YOUR_RENDER_BACKEND_URL.onrender.com/api`
3. Redeploy

## Verify It Works

After rebuilding and deploying:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh your frontend
4. Check image requests - should show your Render URL, not localhost
5. Example: `https://tropical-backend.onrender.com/uploads/image.png`

## Common Mistakes

❌ **Wrong**: `VITE_API_BASE=http://localhost:5000/api`
✅ **Correct**: `VITE_API_BASE=https://your-app.onrender.com/api`

❌ **Wrong**: Missing `/api` at the end
✅ **Correct**: Must include `/api`

❌ **Wrong**: Using `http://` instead of `https://`
✅ **Correct**: Render uses `https://`

## Quick Copy-Paste Template

**frontend/.env**:
```env
VITE_API_BASE=https://YOUR_RENDER_BACKEND_URL.onrender.com/api
```

**tropical-cms/.env**:
```env
VITE_API_URL=https://YOUR_RENDER_BACKEND_URL.onrender.com
```

**Replace `YOUR_RENDER_BACKEND_URL` with your actual Render service URL!**

## After Setup

1. ✅ Create `.env` files with your Render URL
2. ✅ Rebuild: `npm run build`
3. ✅ Redeploy
4. ✅ Test - images should load from Render, not localhost
