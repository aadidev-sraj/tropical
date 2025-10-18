# Tropical CMS - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Run the Admin Panel
```bash
npm run dev
```

The admin panel will open at `http://localhost:5173`

## 🔐 First Login

You need an admin user account. If you don't have one:

### Create Admin User in MongoDB

**Option 1: Update existing user**
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

**Option 2: Create new admin user**
```javascript
// First, hash a password (use Node.js)
const bcrypt = require('bcryptjs');
const password = bcrypt.hashSync('your-password', 10);

// Then insert in MongoDB
db.users.insertOne({
  name: "Admin User",
  email: "admin@tropical.com",
  password: password, // use the hashed password from above
  role: "admin",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 📋 What You Can Do

### Products
- ➕ Add new products with images
- ✏️ Edit product details and pricing
- 🗑️ Delete products
- 📸 Upload multiple product images

### Orders
- 📦 View all customer orders
- 🔄 Update order status
- 👁️ View detailed order information
- 📧 Customer contact details

### Wheel Items (Featured)
- 🎡 Add images for the spinning wheel
- ✏️ Edit existing wheel items
- 🔄 Toggle active/inactive status
- 🗑️ Remove wheel items

## 🛠️ Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## ⚠️ Prerequisites

Make sure these are running:
- ✅ Backend server (`http://localhost:5000`)
- ✅ MongoDB database
- ✅ Admin user created

## 🐛 Troubleshooting

**Can't login?**
- Check if user has `role: "admin"` in database
- Verify backend is running
- Clear browser localStorage

**Images not uploading?**
- Check backend `uploads/` folder exists
- Verify file size < 5MB
- Only jpeg, jpg, png, gif, webp allowed

**API errors?**
- Verify `VITE_API_URL` in `.env`
- Check backend is running on correct port
- Look at browser console for details

## 📚 Need More Help?

See the full documentation:
- `README.md` - Complete setup guide
- `../CMS_MIGRATION_GUIDE.md` - Migration from Strapi
- `../backend/QUICK_START.md` - Backend setup

## 🎯 Quick Tips

1. **Always start backend first** before admin panel
2. **Use Chrome DevTools** to debug API calls
3. **Check MongoDB** if data doesn't appear
4. **Refresh after changes** to see updates
5. **Logout and login** if you see auth errors
