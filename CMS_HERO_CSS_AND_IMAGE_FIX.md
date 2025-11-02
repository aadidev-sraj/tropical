# CMS Hero Section - CSS Glitch and Image Visibility Fix

## Problems Identified

### 1. CSS Glitch Effect
**Symptom**: Page glitches/jumps when opening the hero section in CMS

**Root Cause**: The `.hero-overlay` div was positioned **outside** the `.hero-preview` container, causing incorrect absolute positioning and layout shifts.

**CSS Structure (BEFORE - BROKEN)**:
```jsx
<div className="hero-card">
  <div className="hero-preview">
    <img ... />
  </div>
  <div className="hero-overlay">  {/* ❌ Outside preview container */}
    <h2>Title</h2>
  </div>
</div>
```

The overlay was trying to position itself absolutely but had no proper parent container, causing it to float and create layout glitches.

### 2. Images Not Visible
**Symptom**: Uploaded hero images don't appear in CMS or frontend

**Potential Causes**:
- Incorrect URL construction in `toImageUrl()`
- CORS issues
- Backend not serving files correctly
- Database storing wrong paths

## Fixes Applied

### Fix 1: Corrected CSS Structure
**File**: `tropical-cms/src/pages/Hero.jsx`

**Changed Structure (AFTER - FIXED)**:
```jsx
<div className="hero-card">
  <div className="hero-preview">
    <img ... />
    <div className="hero-overlay">  {/* ✅ Inside preview container */}
      <h2>Title</h2>
    </div>
  </div>
</div>
```

**Why This Works**:
- `.hero-preview` has `position: relative`
- `.hero-overlay` has `position: absolute`
- Overlay is now correctly positioned relative to its parent
- No more layout shifts or glitches

### Fix 2: Enhanced Image Error Handling
**Files**: 
- `tropical-cms/src/pages/Hero.jsx`
- `frontend/src/components/Hero.tsx`

**Added**:
- Console logging for successful image loads
- Console logging for failed image loads with attempted URLs
- Better error handling that doesn't break the DOM
- Debug output to track URL conversion

**CMS Hero Card**:
```jsx
<img 
  src={toImageUrl(hero.backgroundImage)} 
  alt={hero.title}
  onLoad={() => console.log('Hero image loaded:', toImageUrl(hero.backgroundImage))}
  onError={(e) => {
    console.error('Failed to load hero image:', hero.backgroundImage);
    console.error('Attempted URL:', toImageUrl(hero.backgroundImage));
    // Show error message without breaking DOM
  }}
/>
```

**Frontend Hero**:
```jsx
<img
  src={backgroundImage}
  alt={heroData.title}
  onLoad={() => console.log("Hero image loaded successfully:", backgroundImage)}
  onError={(e) => {
    console.error("Hero image failed to load:", backgroundImage);
    // Fallback to default image
  }}
/>
```

## Debugging Steps

### Step 1: Check Browser Console
When you open the hero section or view the frontend, check the console for:

**Success Messages**:
```
Hero image loaded: https://your-backend.com/uploads/image-123.jpg
```

**Error Messages**:
```
Failed to load hero image: /uploads/image-123.jpg
Attempted URL: https://your-backend.com/uploads/image-123.jpg
```

### Step 2: Verify Image URLs
The console will show:
1. **Original path** from database (e.g., `/uploads/image.jpg`)
2. **Converted URL** after `toImageUrl()` (e.g., `https://backend.com/uploads/image.jpg`)

### Step 3: Check Network Tab
1. Open browser DevTools → Network tab
2. Filter by "Img"
3. Look for failed requests (red)
4. Check the request URL and response

**Common Issues**:
- **404 Not Found**: File doesn't exist on server
- **403 Forbidden**: CORS or permission issue
- **ERR_CONNECTION_REFUSED**: Backend not running

### Step 4: Verify Backend
Check if backend is serving files:
```bash
# Direct URL test
curl https://your-backend.com/uploads/your-image.jpg

# Or open in browser
https://your-backend.com/uploads/your-image.jpg
```

## Configuration Checklist

### CMS Environment
**File**: `tropical-cms/.env`
```env
VITE_API_URL=http://localhost:5000
# OR for production:
VITE_API_URL=https://tropical-backend.onrender.com
```

### Frontend Environment
**File**: `frontend/.env`
```env
VITE_API_BASE=http://localhost:5000/api
# OR for production:
VITE_API_BASE=https://tropical-backend.onrender.com/api
```

### Backend Static Files
**File**: `backend/src/server.js`
```javascript
// Must have this line:
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

### Backend CORS
**File**: `backend/src/server.js`
```javascript
const allowedOrigins = [
  'http://localhost:5173',  // Frontend dev
  'http://localhost:5174',  // CMS dev
  'https://your-frontend.com',
  'https://your-cms.com'
];
```

## Testing Instructions

### Test 1: CMS Display
1. Open CMS and navigate to Hero Section
2. ✅ Page should NOT glitch or jump
3. ✅ Existing hero cards should display properly
4. ✅ Images should be visible (if uploaded)
5. Check console for any error messages

### Test 2: Image Upload
1. Click "Add Hero Section" or edit existing
2. Upload a background image
3. ✅ Image preview should appear
4. ✅ No glitch effect
5. Check console: Should see "Image loaded successfully"
6. Save the hero section
7. ✅ Image should appear in the hero card

### Test 3: Frontend Display
1. Open the frontend website
2. ✅ Hero section should display
3. ✅ Background image should be visible
4. Check console for image loading messages
5. If image fails, should fallback to default

## Common Issues & Solutions

### Issue: CSS Still Glitching
**Solution**:
1. Hard refresh the CMS (Ctrl+Shift+R)
2. Clear browser cache
3. Verify the hero-overlay is inside hero-preview in the DOM inspector

### Issue: Images Not Showing in CMS
**Check**:
1. Console errors for the exact URL being attempted
2. Network tab for 404 or CORS errors
3. `VITE_API_URL` in CMS `.env`
4. Backend is running and accessible

### Issue: Images Not Showing in Frontend
**Check**:
1. Console errors for the exact URL being attempted
2. `VITE_API_BASE` in frontend `.env`
3. Backend `/uploads` folder has the files
4. CORS allows frontend origin

### Issue: Image Uploads But Doesn't Display
**Check**:
1. Database has the correct path (should be `/uploads/filename.ext`)
2. File actually exists in `backend/uploads/` folder
3. `toImageUrl()` is being called on the path
4. No typos in the filename

## Files Modified

### CMS
- ✅ `tropical-cms/src/pages/Hero.jsx` - Fixed CSS structure, added logging
- ✅ `tropical-cms/src/utils/api.js` - Already has enhanced toImageUrl

### Frontend
- ✅ `frontend/src/components/Hero.tsx` - Added logging
- ✅ `frontend/src/lib/api.ts` - Already has enhanced toImageUrl

## Summary

✅ **Fixed**: CSS glitch by moving overlay inside preview container
✅ **Added**: Comprehensive logging for debugging image issues
✅ **Improved**: Error handling for image loading
✅ **Ready**: For testing and debugging image visibility

## Next Steps

1. Test the CMS hero section - verify no glitching
2. Check browser console for image loading messages
3. If images still don't show, use the console output to diagnose
4. Verify environment variables are correct
5. Check backend is serving files from `/uploads`
