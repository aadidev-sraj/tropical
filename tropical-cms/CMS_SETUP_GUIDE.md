# CMS Setup Guide

## Quick Fix for "Products Not Displaying" Issue

### Problem
The CMS was not displaying products because:
1. Missing `/api` prefix in API calls
2. CORS not allowing localhost:8080

### Solutions Applied

#### 1. Fixed API Configuration
Updated `src/utils/api.js` to include `/api` prefix:
```javascript
baseURL: `${API_URL}/api`
```

#### 2. Fixed CORS in Backend
Updated `backend/src/server.js` to allow localhost:8080:
```javascript
'http://localhost:5173,http://localhost:8080,...'
```

## Setup Steps

### 1. Create `.env` file in CMS root
Create a file named `.env` in `tropical-cms/` folder with:
```
VITE_API_URL=http://localhost:5000
```

### 2. Restart Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
CORS Allowed Origins: [
  'http://localhost:5173',
  'http://localhost:8080',
  ...
]
```

### 3. Restart CMS Dev Server
```bash
cd tropical-cms
npm run dev
```

### 4. Verify Connection
Open browser console (F12) and check for:
- "Fetching products from API..."
- "Products API response: ..."
- No CORS errors

## Troubleshooting

### Still seeing CORS errors?
- Make sure backend is running on port 5000
- Check backend console shows: `CORS Allowed Origins: [...'http://localhost:8080'...]`
- Clear browser cache and reload

### Products still not showing?
1. Open browser console (F12)
2. Check Network tab for failed requests
3. Look at Console tab for error messages
4. Verify MongoDB is running and has data

### Check if backend is working
Visit: http://localhost:5000/api/health
Should return: `{"status":"ok","message":"Server is running"}`

### Check products endpoint directly
Visit: http://localhost:5000/api/products
Should return JSON with products array

## API Endpoints Used by CMS

- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/designs` - Get all designs
- `POST /api/designs` - Create design
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images

All endpoints require the backend to be running on port 5000 (or the port specified in VITE_API_URL).
