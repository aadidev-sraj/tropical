# Customization Flow - Admin-Controlled Design System

## Overview
The customization system has been restructured so that:
- **Admin controls** which products can be customized
- **Admin uploads** all designs available for customization
- **Users select** from admin-uploaded designs only (no user uploads)

## Backend Changes

### 1. Product Model (`backend/src/models/product.model.js`)
- Added `customizable: Boolean` field (default: false)
- Admin marks products as customizable during creation/editing

### 2. Design System
- **Model**: `backend/src/models/design.model.js` (already existed)
  - Stores admin-uploaded designs
  - Fields: name, description, imageUrl, category, tags, isActive, applicableCategories
- **Routes**: `backend/src/routes/design.routes.js`
  - `GET /api/designs` - List all designs (with filters)
  - `POST /api/designs` - Create design (admin)
  - `PUT /api/designs/:id` - Update design (admin)
  - `DELETE /api/designs/:id` - Delete design (admin)
- **Controller**: `backend/src/controllers/design.controller.js`
- Routes registered in `backend/src/server.js`

### 3. Upload System
- Upload directory now configurable via `UPLOADS_DIR` env variable
- For Render: attach a Disk and set `UPLOADS_DIR=/data/uploads`
- Uploads persist across redeploys

## Frontend Changes

### 1. New Customization Page (`frontend/src/pages/CustomizeProduct_v2.tsx`)
- Fetches only products where `customizable: true`
- Displays admin-uploaded designs only
- User workflow:
  1. Select product color
  2. Choose design for front (from admin designs)
  3. Choose design for back (from admin designs)
  4. Preview on canvas
  5. Add to cart
- **No user uploads** - removed file input functionality
- Route: `/customize-v2/:slug`

### 2. Customizable Products Listing (`frontend/src/pages/CustomizableProducts.tsx`)
- Filters products to show only `customizable: true`
- Links to new v2 customization page
- Route: `/customizable-products`

### 3. Image URL Handling
- Added `toImageUrl()` helper in `frontend/src/lib/api.ts`
- Converts relative backend paths (e.g., `/uploads/xyz.png`) to absolute URLs
- Used in product images and design images

### 4. Routes (`frontend/src/App.tsx`)
- `/customizable-products` - List customizable products
- `/customize-v2/:slug` - Customize specific product with admin designs

## CMS Changes

### 1. Products Page (`tropical-cms/src/pages/Products.jsx`)
- Added **"Allow Customization"** checkbox in product form
- Shows "Customizable" badge on product cards
- Admin can enable/disable customization per product

### 2. Designs Page (`tropical-cms/src/pages/Designs.jsx`)
- Already exists - admin uploads designs here
- Upload design image via file input
- Set name, description, category, tags
- Mark as active/inactive
- Specify applicable product categories

## Admin Workflow

### To Make a Product Customizable:
1. Go to CMS → Products
2. Create/Edit product
3. Check **"Allow Customization"** checkbox
4. Save product

### To Add Designs for Customization:
1. Go to CMS → Designs
2. Click "Add Design"
3. Upload design image (PNG/JPG with transparent background recommended)
4. Fill in name, description, category
5. Select applicable product categories (or "all")
6. Mark as Active
7. Save

## User Workflow

### To Customize a Product:
1. Visit `/customizable-products` page
2. Browse products marked as customizable
3. Click "Start Customizing" on desired product
4. Select product color from palette
5. Choose design for front view from admin designs grid
6. Switch to back view
7. Choose design for back view from admin designs grid
8. Preview updates in real-time on canvas
9. Click "Add to Cart" (requires at least one design selected)

## Environment Variables

### Backend (Render)
```
UPLOADS_DIR=/data/uploads
CORS_ALLOWED_ORIGINS=https://tropical-frontend.onrender.com, https://tropical-dl04.onrender.com
MONGODB_URI=<your-mongodb-uri>
```

### Frontend (Render)
```
VITE_API_BASE=https://tropical-backend.onrender.com/api
```

### CMS (Render)
```
VITE_API_URL=https://tropical-backend.onrender.com
```

## Deployment Steps

1. **Backend**:
   - Attach Render Disk (1-5 GB)
   - Set `UPLOADS_DIR=/data/uploads`
   - Set `CORS_ALLOWED_ORIGINS` with all frontend/CMS URLs
   - Commit and push backend changes
   - Redeploy

2. **Frontend**:
   - Set `VITE_API_BASE` in Render environment
   - Commit and push frontend changes
   - Redeploy

3. **CMS**:
   - Deploy as Static Site (not Web Service)
   - Set `VITE_API_URL` in Render environment
   - Build command: `npm ci --include=dev && npm run build`
   - Publish directory: `dist`
   - Redeploy

## Key Benefits

- **Quality Control**: Admin curates all designs
- **Brand Consistency**: Only approved designs available
- **No Abuse**: Users can't upload inappropriate content
- **Simpler UX**: Users just pick from a gallery
- **Persistent Storage**: Uploads survive redeploys (with Render Disk)

## Files Changed

### Backend
- `backend/src/models/product.model.js` - Added customizable field
- `backend/src/server.js` - Registered design routes
- `backend/src/middleware/upload.middleware.js` - Configurable upload dir

### Frontend
- `frontend/src/lib/api.ts` - Added toImageUrl helper
- `frontend/src/lib/products.ts` - Use toImageUrl
- `frontend/src/pages/CustomizeProduct_v2.tsx` - New admin-design-only customization
- `frontend/src/pages/CustomizableProducts.tsx` - Filter by customizable flag
- `frontend/src/App.tsx` - Added new routes

### CMS
- `tropical-cms/src/pages/Products.jsx` - Added customizable checkbox
- `tropical-cms/src/pages/Designs.jsx` - Already existed, no changes needed

## Testing Checklist

- [ ] Admin can mark product as customizable in CMS
- [ ] Admin can upload designs in CMS Designs page
- [ ] Only customizable products appear on `/customizable-products`
- [ ] Design selection updates canvas preview
- [ ] Color picker changes product color
- [ ] Front/back view toggle works
- [ ] Add to cart requires at least one design
- [ ] Images load from backend (not 404)
- [ ] Uploads persist after backend redeploy (with Render Disk)
