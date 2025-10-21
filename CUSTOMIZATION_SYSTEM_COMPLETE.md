# ✅ Complete Customization System Documentation

## Overview
The customization system is **fully implemented** and allows:
1. ✅ Admin enables products for customization in CMS
2. ✅ Customers upload their own photos (front/back)
3. ✅ Admin uploads approved designs in CMS
4. ✅ Customers can only use admin-approved designs as graphics

---

## 🎯 How It Works

### **For Admins (CMS)**

#### 1. Enable Product Customization
**Location:** `http://localhost:8080` → Products

When creating/editing a product:
- Check the **"Allow Customization"** checkbox
- This enables the customization feature for that product

**File:** `tropical-cms/src/pages/Products.jsx`
```javascript
<input
  type="checkbox"
  name="customizable"
  checked={formData.customizable}
  onChange={handleInputChange}
/>
<span>Allow Customization (users can add admin designs)</span>
```

#### 2. Upload Approved Designs
**Location:** `http://localhost:8080` → Designs

- Click "+ Add Design"
- Upload design image (PNG/JPG with transparent background recommended)
- Set name, description, category
- Mark as "Active" to make it available to customers
- Only **active designs** appear in customer customization

**File:** `tropical-cms/src/pages/Designs.jsx`
- Manages all approved designs
- Admin can activate/deactivate designs
- Customers can only see active designs

---

### **For Customers (Frontend)**

#### 1. Browse Products
**Location:** `http://localhost:5173/products/:slug`

When viewing a customizable product:
- Blue notification box appears: "✨ This product is available for customization!"
- Shows **"🎨 Customize This Product"** button instead of "Add to Cart"

**File:** `frontend/src/pages/Product.tsx`
```tsx
{product.customizable && (
  <div className="mb-4 p-4 bg-blue-50">
    <p>✨ This product is available for customization!</p>
  </div>
)}

{product.customizable ? (
  <Link to={`/customize-product/${slug}`}>
    🎨 Customize This Product
  </Link>
) : (
  <button onClick={addToCart}>Add to Cart</button>
)}
```

#### 2. Customize Product
**Location:** `http://localhost:5173/customize-product/:slug`

**File:** `frontend/src/pages/CustomizeProduct_v2.tsx`

**Features:**
- ✅ **Product Color Picker** - Choose any color for the base product
- ✅ **Size Selection** - Required if product has sizes
- ✅ **Front/Back View Toggle** - Switch between views
- ✅ **Upload Personal Photos**
  - Max 5MB per photo
  - Separate uploads for front and back
  - Photos appear as **background layer**
  - Can remove and re-upload
- ✅ **Select Admin Designs**
  - Grid view of all active designs
  - Only admin-approved designs shown
  - Designs appear as **foreground layer** (on top of photos)
  - Can select different designs for front and back
- ✅ **Live Canvas Preview**
  - Real-time preview of customization
  - Shows layering: Product → Photo → Design
- ✅ **Dynamic Pricing**
  - Base product price
  - +₹150 for personal photos
  - +₹100 per admin design

---

## 📁 File Structure

### Backend
```
backend/src/
├── models/
│   ├── product.model.js      # Has 'customizable' field
│   └── design.model.js        # Stores admin designs
├── routes/
│   ├── product.routes.js      # Product CRUD
│   └── design.routes.js       # Design CRUD
└── controllers/
    ├── product.controller.js
    └── design.controller.js
```

### Frontend
```
frontend/src/
├── pages/
│   ├── Product.tsx                  # Shows customize button
│   └── CustomizeProduct_v2.tsx      # Main customization page
├── lib/
│   └── products.ts                  # Product type with customizable field
└── App.tsx                          # Route: /customize-product/:slug
```

### CMS
```
tropical-cms/src/
├── pages/
│   ├── Products.jsx    # Enable customization checkbox
│   └── Designs.jsx     # Upload and manage designs
└── utils/
    └── api.js          # API calls to backend
```

---

## 🎨 Customization Flow

### Step-by-Step User Journey

1. **Customer browses products** → Sees "Customize" button on customizable products
2. **Clicks "Customize This Product"** → Redirected to `/customize-product/:slug`
3. **Customization Page Opens:**
   - Selects product color
   - Selects size (if required)
   - Switches to Front view
   - Uploads personal photo for front (optional)
   - Selects admin design for front (optional)
   - Switches to Back view
   - Uploads personal photo for back (optional)
   - Selects admin design for back (optional)
4. **Reviews preview** → Canvas shows real-time preview
5. **Checks pricing** → Summary shows all charges
6. **Clicks "Add to Cart"** → Customization saved with cart item

---

## 💾 Data Storage

### Cart Item with Customization
```javascript
{
  id: productId,
  name: "Product Name (Customized)",
  price: calculatedPrice,
  quantity: 1,
  size: "M",
  image: canvasPreviewUrl,
  customization: {
    color: "#ffffff",
    frontPhoto: "base64...",      // Customer's photo
    backPhoto: "base64...",        // Customer's photo
    frontDesign: "designId123",    // Admin design ID
    backDesign: "designId456",     // Admin design ID
    previewUrl: "canvas preview"
  }
}
```

---

## 🎯 Key Features Implemented

### ✅ Admin Controls
- [x] Enable/disable customization per product
- [x] Upload approved designs
- [x] Activate/deactivate designs
- [x] Manage design categories and tags

### ✅ Customer Features
- [x] Upload personal photos (front/back)
- [x] Select from admin-approved designs only
- [x] Choose product colors
- [x] Select sizes
- [x] Live preview on canvas
- [x] Layer system (photo as background, design as foreground)
- [x] Dynamic pricing

### ✅ Technical Features
- [x] Canvas-based preview rendering
- [x] Image layering system
- [x] File size validation (5MB max)
- [x] Image type validation
- [x] Responsive design
- [x] Error handling
- [x] Loading states

---

## 🚀 How to Test

### 1. Start All Services
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - CMS
cd tropical-cms
npm run dev
```

### 2. In CMS (http://localhost:8080)
1. Go to Products
2. Create a new product or edit existing
3. Check "Allow Customization"
4. Save product
5. Go to Designs
6. Upload a design (e.g., logo, graphic)
7. Mark as Active
8. Save design

### 3. In Frontend (http://localhost:5173)
1. Browse to the customizable product
2. Click "🎨 Customize This Product"
3. Upload a photo for front
4. Select an admin design
5. Switch to back view
6. Upload a photo for back
7. Select another design
8. Review preview
9. Add to cart

---

## 🎨 Design Layer System

The canvas renders in this order (bottom to top):

1. **Base Product Image** - The t-shirt/product outline
2. **Color Tint** - Applied color using multiply blend mode
3. **Customer Photo** (if uploaded) - 60% size, centered
4. **Admin Design** (if selected) - 40% size, centered, on top

This ensures:
- Photos appear as background
- Admin designs overlay on top
- Both are visible and well-composed

---

## 📊 Pricing Structure

| Item | Price |
|------|-------|
| Base Product | Product price (e.g., ₹599) |
| Personal Photos | +₹150 (for front or back or both) |
| Front Design | +₹100 |
| Back Design | +₹100 |

**Example:**
- Base T-shirt: ₹599
- Front photo: +₹150
- Front design: +₹100
- Back design: +₹100
- **Total: ₹949**

---

## 🔧 API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:slug` - Get single product (includes customizable field)
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)

### Designs
- `GET /api/designs?isActive=true` - Get active designs (customer)
- `GET /api/designs` - Get all designs (admin)
- `POST /api/designs` - Create design (admin)
- `PUT /api/designs/:id` - Update design (admin)
- `DELETE /api/designs/:id` - Delete design (admin)

---

## ✨ Summary

**The complete customization system is ready to use!**

- ✅ Admins control which products are customizable
- ✅ Admins upload and manage approved designs
- ✅ Customers can upload their own photos
- ✅ Customers can only use admin-approved designs
- ✅ Real-time preview with proper layering
- ✅ Dynamic pricing based on customization
- ✅ Full integration with cart system

**All files are created and configured. The system is production-ready!**
