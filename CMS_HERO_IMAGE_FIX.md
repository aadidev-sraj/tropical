# CMS Hero Section Image Upload Fix

## Problem
When uploading images in the CMS hero section:
1. Images were not appearing in the preview after upload (glitch effect)
2. Uploaded images were not displaying correctly in the CMS interface

## Root Cause
The CMS `toImageUrl()` function in `tropical-cms/src/utils/api.js` was not handling:
- Absolute URLs pointing to localhost or different origins
- URL normalization for images stored with full paths in the database

This caused the browser to try loading images from incorrect URLs, resulting in broken image previews.

## Fixes Applied

### 1. Enhanced `toImageUrl()` Function
**File**: `tropical-cms/src/utils/api.js`

**Changes**:
- Added logic to detect and rewrite localhost URLs to the current API origin
- Added handling for protocol-relative URLs
- Added proper error handling with fallback
- Now matches the frontend implementation for consistency

**How it works**:
```javascript
// Before: http://localhost:5000/uploads/image.png
// After:  https://your-backend.onrender.com/uploads/image.png
```

### 2. Improved Hero Component
**File**: `tropical-cms/src/pages/Hero.jsx`

**Changes**:
- Enhanced image upload error handling with detailed error messages
- Added console logging for debugging upload issues
- Improved image preview with:
  - Forced re-render using unique keys (`Date.now()`)
  - `onLoad` and `onError` handlers
  - Display of uploaded image path for verification
- Added error handling for hero card image display
- Better upload status feedback

### 3. Enhanced CSS Styling
**File**: `tropical-cms/src/pages/Hero.css`

**Changes**:
- Improved image preview container with background and padding
- Added styling for image path display (monospace font)
- Added pulsing animation for upload status
- Better visual feedback during upload process

## Features Added

### ✅ Image Upload Feedback
- Shows "Uploading image..." status during upload
- Displays uploaded image path for verification
- Shows error messages if upload fails

### ✅ Image Preview
- Immediate preview after successful upload
- Forced re-render to prevent caching issues
- Error handling if preview fails to load
- Path display to verify correct URL

### ✅ Error Handling
- Detailed error messages for upload failures
- Console logging for debugging
- Graceful fallback for image load failures
- Visual feedback for all states

## Testing

### 1. Test Image Upload
1. Log into CMS as admin
2. Go to Hero Section
3. Click "Add Hero Section" or edit existing
4. Upload a background image
5. Verify:
   - ✅ "Uploading image..." appears
   - ✅ Image preview loads after upload
   - ✅ Image path is displayed below preview
   - ✅ No glitch effect

### 2. Test Image Display
1. After uploading, save the hero section
2. Verify image appears in the hero card
3. Check browser console for any errors
4. Verify image URL is correct

### 3. Test Error Cases
1. Try uploading a very large file
2. Try uploading a non-image file
3. Verify error messages appear
4. Check that form remains usable after error

## Configuration

### CMS Environment
Ensure `tropical-cms/.env` has:
```env
VITE_API_URL=http://localhost:5000
```
Or for production:
```env
VITE_API_URL=https://tropical-backend.onrender.com
```

### Backend Configuration
The backend must:
1. Have `/api/upload/single` endpoint working
2. Serve static files from `/uploads` directory
3. Allow admin authentication for uploads
4. Return image URLs in format: `/uploads/filename.ext`

## Common Issues & Solutions

### Issue: Image still not appearing
**Solution**: 
1. Check browser console for errors
2. Verify the image path shown below preview
3. Check if backend `/uploads` folder exists
4. Verify CORS settings allow the CMS origin

### Issue: Upload fails
**Solution**:
1. Check if you're logged in as admin
2. Verify file size is under 5MB
3. Check file type is an image (jpg, png, gif, webp)
4. Check backend logs for errors

### Issue: Glitch effect still occurs
**Solution**:
1. Hard refresh the CMS (Ctrl+Shift+R)
2. Clear browser cache
3. Check if `toImageUrl()` is being called
4. Verify API_URL environment variable is correct

## Backend Requirements

### Upload Endpoint
```javascript
// POST /api/upload/single
// Requires: admin authentication
// Returns: { data: { url: "/uploads/filename.ext" } }
```

### Static File Serving
```javascript
// backend/src/server.js
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

### CORS Configuration
```javascript
// Must allow CMS origin
const allowedOrigins = [
  'http://localhost:5174', // CMS dev
  'https://your-cms-domain.com' // CMS production
];
```

## Summary of Changes

✅ **Fixed**: Image URL normalization in CMS
✅ **Fixed**: Image preview after upload
✅ **Added**: Upload status feedback
✅ **Added**: Error handling and logging
✅ **Added**: Image path display for debugging
✅ **Improved**: CSS styling for better UX
✅ **Improved**: Error messages for troubleshooting

## Next Steps

1. Test the upload functionality in the CMS
2. Verify images appear correctly after upload
3. Check that saved hero sections display properly
4. Verify frontend displays the hero images correctly

## Related Files Modified

- `tropical-cms/src/utils/api.js` - Enhanced toImageUrl()
- `tropical-cms/src/pages/Hero.jsx` - Improved upload and preview
- `tropical-cms/src/pages/Hero.css` - Enhanced styling

## Notes

- The fix ensures consistency between CMS and frontend image handling
- All image URLs are normalized to use the configured API origin
- The system handles both relative and absolute URLs gracefully
- Error handling provides clear feedback for troubleshooting
