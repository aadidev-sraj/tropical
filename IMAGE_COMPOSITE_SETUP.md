# ✅ Image Composite System - Setup Guide

## Overview
The system now generates proper composite images by overlaying the design on the product image, instead of sending blank screenshots.

---

## What Was Implemented

### 1. Backend Image Composite Service
**File:** `backend/src/services/image-composite.service.js`
- Uses `sharp` library for image processing
- Composites design overlay onto product image
- Handles position and size calculations
- Supports both front and back views

### 2. Frontend Updates
**File:** `frontend/src/pages/CustomizeProduct_new.tsx`
- Sends design image URLs to backend
- Sends product image URLs (front and back)
- Includes all positioning and sizing data

### 3. Payment Controller Updates
**File:** `backend/src/controllers/payment.controller.js`
- Generates composite images before saving order
- Replaces screenshot URLs with composite URLs
- Emails contain proper product+design images

### 4. New API Endpoint
**Route:** `POST /api/upload/composite`
- Creates composite images on demand
- Requires authentication
- Returns composite image URL

---

## Installation Required

### Install Sharp Package
```bash
cd backend
npm install sharp
```

Sharp is a high-performance image processing library for Node.js.

---

## How It Works

### Order Flow

1. **Customer customizes product**
   - Selects design for front/back
   - Positions and resizes design
   - Adds to cart

2. **Cart stores customization data**
   - Design IDs
   - Design image URLs
   - Product image URLs (front/back)
   - Position (x, y percentages)
   - Size (pixels)

3. **Customer places order**
   - Payment verified
   - Backend receives customization data

4. **Backend generates composite images**
   - For each customized item:
     - Downloads product image
     - Downloads design image
     - Resizes design to specified size
     - Positions design at specified coordinates
     - Composites design onto product
     - Saves composite image

5. **Order saved with composite URLs**
   - `frontImageUrl`: composite-front-{productId}-{timestamp}.png
   - `backImageUrl`: composite-back-{productId}-{timestamp}.png

6. **Emails sent with composite images**
   - Customer receives composite images
   - Admin receives composite images
   - Images show actual product with design overlay

---

## Image Composite Process

### Input
```javascript
{
  productImageUrl: "/uploads/product-front.jpg",
  designImageUrl: "/uploads/design-logo.png",
  position: { x: 50, y: 45 },  // Percentage
  size: 200,                    // Pixels
  outputFilename: "composite-front-123-1234567890.png"
}
```

### Process
1. **Load product image** (e.g., 1000x1000px)
2. **Load design image** (e.g., 500x500px)
3. **Resize design** to specified size (200x200px)
4. **Calculate position** in pixels:
   - x = (50 / 100) * 1000 = 500px
   - y = (45 / 100) * 1000 = 450px
5. **Composite** design onto product at (500, 450)
6. **Save** composite image

### Output
```
/uploads/composite-front-123-1234567890.png
```

---

## API Endpoints

### Generate Composite Image
```
POST /api/upload/composite
Authorization: Bearer {token}

Body:
{
  "productImageUrl": "/uploads/product-front.jpg",
  "designImageUrl": "/uploads/design-logo.png",
  "position": { "x": 50, "y": 45 },
  "size": 200,
  "outputFilename": "composite-front-123-1234567890.png"
}

Response:
{
  "message": "Composite image created successfully",
  "data": { "url": "/uploads/composite-front-123-1234567890.png" },
  "url": "/uploads/composite-front-123-1234567890.png"
}
```

---

## Data Structure

### Cart Item Customization
```javascript
{
  customization: {
    frontDesign: "designId123",
    backDesign: "designId456",
    frontDesignPos: { x: 50, y: 45 },
    backDesignPos: { x: 50, y: 55 },
    frontDesignSize: 200,
    backDesignSize: 250,
    frontDesignImageUrl: "/uploads/design-logo.png",    // NEW
    backDesignImageUrl: "/uploads/design-pattern.png",  // NEW
    productImages: {                                     // NEW
      front: "http://localhost:5000/uploads/product-front.jpg",
      back: "http://localhost:5000/uploads/product-back.jpg"
    }
  }
}
```

### Order Item Customization (After Composite)
```javascript
{
  customization: {
    frontDesign: "designId123",
    backDesign: "designId456",
    frontDesignPos: { x: 50, y: 45 },
    backDesignPos: { x: 50, y: 55 },
    frontDesignSize: 200,
    backDesignSize: 250,
    frontImageUrl: "/uploads/composite-front-123-1234567890.png",  // UPDATED
    backImageUrl: "/uploads/composite-back-123-1234567890.png"     // UPDATED
  }
}
```

---

## File Structure

### Backend
```
backend/src/
├── services/
│   └── image-composite.service.js    // NEW: Image compositing logic
├── routes/
│   └── upload.routes.js              // UPDATED: Added /composite endpoint
└── controllers/
    └── payment.controller.js         // UPDATED: Generate composites before save
```

### Frontend
```
frontend/src/pages/
└── CustomizeProduct_new.tsx          // UPDATED: Send design & product URLs
```

---

## Testing

### 1. Install Sharp
```bash
cd backend
npm install sharp
```

### 2. Restart Backend
```bash
npm run dev
```

### 3. Test Customization
1. Go to customizable product
2. Add design to front
3. Position and resize
4. Add to cart
5. Proceed to checkout
6. Complete payment

### 4. Check Results
- **Database**: Order should have composite image URLs
- **Uploads folder**: Should contain `composite-front-*.png` and `composite-back-*.png`
- **Customer email**: Should show product with design overlay
- **Admin email**: Should show product with design overlay

### 5. Verify Images
- Open composite images
- Should show product image with design overlaid
- Design should be at correct position
- Design should be correct size

---

## Troubleshooting

### Sharp installation fails
**Error:** `npm install sharp` fails

**Solution:**
- Make sure you have build tools installed
- Windows: Install Visual Studio Build Tools
- Or use pre-built binaries: `npm install --platform=win32 --arch=x64 sharp`

### Composite images are blank
**Check:**
1. Product image URLs are accessible
2. Design image URLs are accessible
3. Images are in correct format (JPEG, PNG)
4. Backend has read permissions for uploads folder

### Position is incorrect
**Check:**
1. Position is stored as percentage (0-100)
2. Product image dimensions are correct
3. Calculation: `pixelX = (percentX / 100) * imageWidth`

### Design is wrong size
**Check:**
1. Size is in pixels
2. Design is being resized before composite
3. Aspect ratio is maintained

---

## Benefits

### Before (Screenshots)
- ❌ Blank/empty images
- ❌ No actual product visible
- ❌ Admin can't see what to print
- ❌ Customer can't verify order

### After (Composites)
- ✅ Real product image with design
- ✅ Exact position and size shown
- ✅ Admin sees exactly what to print
- ✅ Customer can verify customization
- ✅ Professional appearance

---

## Example Output

### Composite Image
```
Product: White T-Shirt (front view)
Design: Cool Logo (200x200px)
Position: Center (50%, 45%)

Result: White t-shirt with "Cool Logo" centered on chest
```

### Email Preview
```
🎨 Customized: Cool T-Shirt

Front View:
[Image showing white t-shirt with logo on chest]

Back View:
[Image showing white t-shirt with pattern on back]

Attachments:
📎 composite-front-123-1234567890.png
📎 composite-back-123-1234567890.png
```

---

## Summary

**Complete flow:**
1. ✅ Customer customizes product
2. ✅ Frontend sends design + product URLs
3. ✅ Backend generates composite images
4. ✅ Composite images saved to uploads
5. ✅ Order saved with composite URLs
6. ✅ Emails sent with composite images
7. ✅ Admin sees real product with design
8. ✅ Customer sees real product with design

**Install sharp and restart backend to enable!**

```bash
cd backend
npm install sharp
npm run dev
```
