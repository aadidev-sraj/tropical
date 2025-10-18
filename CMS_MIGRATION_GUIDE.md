# CMS Migration Guide - Strapi to Custom Admin Panel

This guide explains the migration from Strapi to a custom admin panel for the Tropical e-commerce application.

## What Changed

### Removed
- ❌ Strapi CMS (previously in `tropical-cms` or separate installation)
- ❌ Strapi-related environment variables
- ❌ Strapi sync endpoints and webhooks
- ❌ Strapi fallback code in frontend

### Added
- ✅ Custom React admin panel in `tropical-cms/`
- ✅ Image upload functionality with multer
- ✅ Admin CRUD endpoints for products and featured items
- ✅ Direct MongoDB integration (no intermediate CMS)

## Architecture

```
tropical/
├── backend/              # Express + MongoDB backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── product.routes.js    # Product CRUD
│   │   │   ├── featured.routes.js   # Featured/Wheel CRUD
│   │   │   ├── order.routes.js      # Order management
│   │   │   └── upload.routes.js     # Image uploads
│   │   ├── controllers/
│   │   ├── models/
│   │   └── middleware/
│   └── uploads/          # Uploaded images stored here
├── frontend/             # Customer-facing website
└── tropical-cms/         # Admin panel (React + Vite)
```

## Setup Instructions

### 1. Backend Setup

The backend now handles everything - no separate CMS needed.

```bash
cd backend
npm install multer  # Already done if you pulled latest
```

**Environment Variables** (`.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tropical
JWT_SECRET=your_secret_key
# ... other existing variables
# NO STRAPI VARIABLES NEEDED
```

**Start Backend**:
```bash
npm run dev
```

### 2. Admin Panel Setup

```bash
cd tropical-cms
npm install
```

**Create `.env` file**:
```env
VITE_API_URL=http://localhost:5000/api
```

**Start Admin Panel**:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173` (or the port Vite assigns).

### 3. Create Admin User

You need an admin user to access the admin panel. Use one of these methods:

**Method A: Via MongoDB directly**
```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

**Method B: Via Backend API**
1. Register a normal user via the frontend
2. Update their role in the database to "admin"

**Method C: Create directly in database**
```javascript
// Use bcrypt to hash password first
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('your-password', 10);

db.users.insertOne({
  name: "Admin User",
  email: "admin@tropical.com",
  password: hashedPassword,
  role: "admin",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 4. Frontend Update

The frontend has been updated to remove Strapi fallback code. It now only uses the backend API.

**No changes needed** - just ensure your backend is running.

## Admin Panel Features

### Login
- Navigate to `http://localhost:5173/login`
- Enter admin credentials
- JWT token stored in localStorage

### Dashboard
- Overview of products and orders
- Recent orders list
- Quick stats

### Products Management
- ➕ Add new products
- ✏️ Edit existing products
- 🗑️ Delete products
- 📸 Upload multiple images per product
- All changes saved directly to MongoDB

### Orders Management
- 📋 View all customer orders
- 🔄 Update order status (pending → confirmed → processing → shipped → delivered)
- 👁️ View detailed order information
- Customer details, items, pricing

### Wheel Items (Featured)
- 🎡 Manage images for the spinning wheel
- Upload multiple images
- Toggle active/inactive status
- Delete items

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Featured Items
- `GET /api/featured` - List active featured items
- `POST /api/featured` - Create featured item (admin only)
- `PUT /api/featured/:id` - Update featured item (admin only)
- `DELETE /api/featured/:id` - Delete featured item (admin only)

### Orders
- `GET /api/orders` - List all orders (admin only)
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/status` - Update order status (admin only)

### Upload
- `POST /api/upload/single` - Upload single image (admin only)
- `POST /api/upload/multiple` - Upload multiple images (admin only)
- `DELETE /api/upload/:filename` - Delete image (admin only)

## Image Storage

Images are now stored in `backend/uploads/` directory and served statically at `/uploads/` endpoint.

**Example image URL**: `http://localhost:5000/uploads/product-1234567890.jpg`

## Migration Checklist

- [x] Remove Strapi installation
- [x] Update backend routes (remove webhooks, add CRUD)
- [x] Add multer for file uploads
- [x] Create admin panel UI
- [x] Remove Strapi fallback from frontend
- [x] Update environment variables
- [x] Create admin user
- [x] Test all functionality

## Troubleshooting

### Admin Panel Won't Load
- Check if backend is running on correct port
- Verify `VITE_API_URL` in admin panel `.env`
- Check browser console for errors

### Can't Login
- Ensure user has `role: "admin"` in database
- Check JWT_SECRET is set in backend `.env`
- Clear localStorage and try again

### Images Not Uploading
- Check `backend/uploads/` directory exists and is writable
- Verify file size is under 5MB
- Check file type is allowed (jpeg, jpg, png, gif, webp)

### Products Not Showing on Frontend
- Ensure backend is running
- Check MongoDB connection
- Verify products exist in database

## Benefits of Custom Admin Panel

1. **No External Dependencies**: No need to run separate Strapi server
2. **Direct Control**: Full control over admin features
3. **Simplified Stack**: One backend, one database
4. **Better Performance**: No intermediate API calls
5. **Easier Deployment**: Deploy admin panel as static site
6. **Customizable**: Easy to add new features specific to your needs

## Next Steps

- Add more admin features (analytics, reports, etc.)
- Implement image optimization
- Add bulk operations
- Create user management interface
- Add activity logs
