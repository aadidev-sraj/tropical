# Localhost Setup Guide

## Prerequisites
- Node.js installed
- MongoDB installed and running locally
- Git (optional)

## Step 1: Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Edit `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/tropical
PORT=5000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
JWT_SECRET=your-secret-key-change-this
```

5. Start MongoDB (if not already running):
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongodb
```

6. Start backend server:
```bash
npm run dev
```

Backend should now be running at `http://localhost:5000`

---

## Step 2: Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` file:
```env
VITE_API_BASE=http://localhost:5000/api
```

5. Start frontend dev server:
```bash
npm run dev
```

Frontend should now be running at `http://localhost:5173`

---

## Step 3: CMS Setup

1. Navigate to CMS folder:
```bash
cd tropical-cms
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

5. Start CMS dev server:
```bash
npm run dev
```

CMS should now be running at `http://localhost:3000` (or another port if 3000 is taken)

---

## Step 4: Test the Customization Flow

### Admin Setup (CMS):

1. Open CMS at `http://localhost:3000`

2. **Upload Designs**:
   - Go to "Designs" page
   - Click "Add Design"
   - Upload a design image (PNG/JPG with transparent background works best)
   - Fill in name, description, category
   - Mark as "Active"
   - Save

3. **Mark Products as Customizable**:
   - Go to "Products" page
   - Create or edit a product
   - Check the **"Allow Customization"** checkbox
   - Add product images, price, etc.
   - Save

### User Flow (Frontend):

1. Open frontend at `http://localhost:5173`

2. Navigate to `/customize` page (or add a link in your nav)

3. You should see:
   - T-shirt fit selector (Regular/Oversized)
   - Color picker for t-shirt base color
   - Front/Back view toggle
   - **Design selection gallery** (showing admin-uploaded designs)
   - Text customization options
   - Add to cart button

4. Test the flow:
   - Select a color
   - Switch to front view
   - Click on a design from the gallery (no upload button!)
   - Switch to back view
   - Select another design
   - Add custom text (optional)
   - Drag text/designs to reposition
   - Add to cart

---

## Troubleshooting

### Backend won't start
- Check if MongoDB is running: `mongosh` or `mongo`
- Check if port 5000 is available
- Check `.env` file exists and has correct values

### Frontend can't connect to backend
- Check backend is running at `http://localhost:5000`
- Check `.env` has `VITE_API_BASE=http://localhost:5000/api`
- Check browser console for CORS errors
- Restart frontend dev server after changing `.env`

### CMS can't connect to backend
- Check `.env` has `VITE_API_URL=http://localhost:5000` (no /api suffix)
- Restart CMS dev server after changing `.env`

### No designs showing in customization page
- Check admin uploaded designs in CMS
- Check designs are marked as "Active"
- Check browser console for API errors
- Verify backend `/api/designs` endpoint returns data:
  ```bash
  curl http://localhost:5000/api/designs
  ```

### Images not loading
- Check backend uploads directory exists: `backend/uploads/`
- Check backend is serving static files at `/uploads`
- Check image URLs in database start with `/uploads/`
- Verify `toImageUrl()` helper is converting paths correctly

---

## Quick Test Commands

### Check backend health:
```bash
curl http://localhost:5000/api/health
```

### Check designs API:
```bash
curl http://localhost:5000/api/designs
```

### Check products API:
```bash
curl http://localhost:5000/api/products
```

---

## File Structure

```
tropical/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── product.model.js (has customizable field)
│   │   │   └── design.model.js
│   │   ├── routes/
│   │   │   ├── design.routes.js
│   │   │   └── ...
│   │   ├── controllers/
│   │   │   ├── design.controller.js
│   │   │   └── ...
│   │   └── server.js (registers /api/designs routes)
│   ├── uploads/ (created automatically)
│   ├── .env (create this)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Customize2D_new.tsx (MODIFIED - no uploads!)
│   │   │   └── ...
│   │   ├── lib/
│   │   │   └── api.ts (has toImageUrl helper)
│   │   └── App.tsx
│   ├── .env (create this)
│   └── package.json
└── tropical-cms/
    ├── src/
    │   └── pages/
    │       ├── Products.jsx (has customizable checkbox)
    │       └── Designs.jsx (admin uploads designs)
    ├── .env (create this)
    └── package.json
```

---

## Summary of Changes

### What Was Changed:
1. **Backend**: Added `customizable` field to Product model
2. **Backend**: Registered `/api/designs` routes
3. **Frontend**: Modified `Customize2D_new.tsx` to remove user uploads
4. **Frontend**: Added design selection gallery fetching from `/api/designs`
5. **CMS**: Added "Allow Customization" checkbox in Products form

### What Users Can Do Now:
- ✅ Select from admin-uploaded designs only
- ✅ Customize t-shirt color
- ✅ Add custom text
- ✅ Position designs and text
- ❌ Cannot upload their own images (removed)

### What Admins Can Do:
- ✅ Upload designs via CMS
- ✅ Mark products as customizable
- ✅ Control which designs are active
- ✅ Manage all customization options
