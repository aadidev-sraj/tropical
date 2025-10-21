# ✅ CMS Designs Management - Complete Guide

## Overview
The CMS now has a **Designs** page where admins can upload, edit, and delete designs that customers can use for customization.

---

## How to Access

1. Open CMS: `http://localhost:8080`
2. Login with admin credentials
3. Click **"Designs"** in the sidebar navigation

---

## Features

### ✅ Upload Designs
- Click **"+ Add Design"** button
- Upload design image (PNG with transparent background recommended)
- Fill in design details
- Mark as "Active" to make it available to customers
- Save

### ✅ Edit Designs
- Click **"Edit"** button on any design card
- Update name, description, category, or image
- Toggle active/inactive status
- Save changes

### ✅ Delete Designs
- Click **"Delete"** button on any design card
- Confirm deletion
- Design is permanently removed

### ✅ View All Designs
- Grid view of all uploaded designs
- Shows design image, name, description
- Indicates active/inactive status
- Empty state if no designs exist

---

## Adding a New Design

### Step-by-Step

1. **Click "+ Add Design"**
   - Opens modal form

2. **Fill in Details:**
   - **Design Name*** (required)
     - Example: "Cool Logo", "Abstract Pattern"
   
   - **Description** (optional)
     - Brief description of the design
   
   - **Category*** (required)
     - Graphic
     - Pattern
     - Logo
     - Text
     - Other
   
   - **Tags** (optional)
     - Comma-separated tags
     - Example: "summer, abstract, cool"
   
   - **Applicable Product Categories**
     - All (default)
     - T-Shirts
     - Shirts
     - Hoodies
   
   - **Active** (checkbox)
     - ✅ Checked = Visible to customers
     - ❌ Unchecked = Hidden from customers

3. **Upload Image***
   - Click "Choose File"
   - Select design image
   - Recommended: PNG with transparent background
   - Image uploads to server
   - Preview shows after upload

4. **Click "Create"**
   - Design is saved to database
   - Appears in designs list
   - Available to customers if marked as active

---

## Editing a Design

1. **Click "Edit" on design card**
2. **Modal opens with current data**
3. **Update any fields:**
   - Change name
   - Update description
   - Change category
   - Add/remove tags
   - Toggle active status
   - Upload new image (optional)
4. **Click "Update"**
5. **Changes are saved**

---

## Deleting a Design

1. **Click "Delete" on design card**
2. **Confirm deletion** in popup
3. **Design is removed** from database
4. **No longer available** to customers

---

## Design Image Guidelines

### Recommended Format
- **File Type:** PNG (with transparency)
- **Size:** 500x500px to 1000x1000px
- **Background:** Transparent
- **Colors:** High contrast for visibility

### Why PNG with Transparency?
- Looks better on different colored products
- No white background box
- Professional appearance
- Flexible placement

### Example Good Designs
- Logos with transparent background
- Icons and symbols
- Text-based designs
- Abstract patterns
- Illustrations

---

## Active vs Inactive Status

### Active Designs (✅)
- **Visible to customers** in customization page
- Appears in design grid
- Can be selected and applied
- Included in API response: `/api/designs?isActive=true`

### Inactive Designs (❌)
- **Hidden from customers**
- Not shown in customization page
- Cannot be selected
- Only visible in CMS
- Useful for:
  - Seasonal designs (activate/deactivate)
  - Testing new designs
  - Temporarily removing designs

---

## How Customers See Designs

### In Customization Page
1. Customer goes to customizable product
2. Clicks "Customize This Product"
3. Sees grid of **active designs only**
4. Can select design for front or back
5. Can position and resize design
6. Adds to cart with design selection

### Design Display
- Grid layout (2 columns)
- Design image preview
- Design name
- Click to select
- Selected design highlighted with blue border

---

## API Endpoints

### Get All Designs (Admin)
```
GET /api/designs
Returns: All designs (active and inactive)
```

### Get Active Designs (Customer)
```
GET /api/designs?isActive=true
Returns: Only active designs
```

### Create Design (Admin)
```
POST /api/designs
Body: { name, description, imageUrl, category, tags, isActive, applicableCategories }
```

### Update Design (Admin)
```
PUT /api/designs/:id
Body: { name, description, imageUrl, category, tags, isActive, applicableCategories }
```

### Delete Design (Admin)
```
DELETE /api/designs/:id
```

---

## Database Schema

```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  imageUrl: String (required),
  category: String (enum: graphic, pattern, logo, text, other),
  tags: [String],
  isActive: Boolean (default: true),
  applicableCategories: [String] (enum: all, tshirts, shirts, hoodies, etc),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Workflow Example

### Scenario: Adding Summer Collection Designs

1. **Admin uploads 5 summer designs**
   - "Beach Waves"
   - "Sun Icon"
   - "Palm Tree"
   - "Tropical Vibes"
   - "Summer Text"

2. **All marked as Active**
   - Customers can see all 5 designs

3. **Customer customizes t-shirt**
   - Selects "Beach Waves" for front
   - Selects "Sun Icon" for back
   - Positions and resizes
   - Adds to cart

4. **End of summer**
   - Admin marks all 5 as Inactive
   - Customers no longer see them
   - Designs preserved for next year

5. **Next summer**
   - Admin marks them as Active again
   - Designs reappear for customers

---

## Troubleshooting

### Designs not showing in CMS?
- Check backend is running
- Check `/api/designs` endpoint
- Look for errors in browser console
- Verify CORS is configured

### Designs not showing to customers?
- Verify design is marked as "Active"
- Check `/api/designs?isActive=true`
- Refresh frontend page
- Clear browser cache

### Image upload failing?
- Check file size (max 5MB)
- Verify file is an image
- Check backend upload folder permissions
- Look for errors in backend console

### Can't delete design?
- Check if design is being used in orders
- Verify admin permissions
- Check backend logs for errors

---

## CMS Navigation

```
CMS Sidebar:
├── Dashboard
├── Products        ← Enable customization here
├── Designs         ← Upload designs here ✨
├── Orders
├── Wheel Items
└── Hero Section
```

---

## Summary

**The Designs page is fully functional and allows admins to:**

✅ **Upload** new designs with images  
✅ **Edit** existing designs (name, description, image, etc.)  
✅ **Delete** designs permanently  
✅ **Toggle** active/inactive status  
✅ **Organize** by categories and tags  
✅ **Control** which designs customers can use  

**Customers can only use designs uploaded and activated by admin!**

---

## Quick Start

1. **Open CMS:** `http://localhost:8080`
2. **Click "Designs"** in sidebar
3. **Click "+ Add Design"**
4. **Upload image** and fill details
5. **Check "Active"**
6. **Click "Create"**
7. **Done!** Design is now available to customers

**That's it! The design management system is ready to use.** 🎨
