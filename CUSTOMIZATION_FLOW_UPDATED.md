# Updated Customization Flow - Hybrid System

## Overview
The customization system now supports:
1. **Admin marks products as customizable** in CMS
2. **Users can upload personal photos** (for front/back as background)
3. **Admin uploads design graphics** in CMS
4. **Users can select admin designs** (as overlay graphics on top of photos)

## User Customization Options

### 1. Personal Photos (User Upload)
- Users can upload their own photos
- Displayed as **background layer** (behind designs)
- Larger size (imageSize + 50px)
- Blue dashed border for identification
- Price: **₹150** extra

### 2. Admin Design Graphics (Admin Upload)
- Admin uploads designs in CMS
- Users select from gallery
- Displayed as **foreground layer** (on top of photos)
- Standard size (imageSize)
- Gold dashed border for identification
- Price: **₹100** extra

### 3. Custom Text
- Front and back text
- Customizable color, size, rotation
- Draggable positioning
- Price: **₹50** extra

### 4. T-Shirt Customization
- Choose fit (Regular/Oversized)
- Pick base color
- Switch between front/back views

## Layer Order (Z-Index)
1. **Bottom**: T-shirt base (with color overlay)
2. **Layer 1**: User uploaded photo (z-index: 1, blue border)
3. **Layer 2**: Admin design graphic (z-index: 2, gold border)
4. **Top**: Custom text (z-index: 3)

## Admin Workflow (CMS)

### Mark Product as Customizable:
1. Go to CMS → Products
2. Create/Edit product
3. Check **"Allow Customization"** checkbox
4. Save product

### Upload Design Graphics:
1. Go to CMS → Designs
2. Click "Add Design"
3. Upload design image (PNG with transparency recommended)
4. Fill in name, description, category
5. Mark as "Active"
6. Save

## User Workflow (Frontend)

### Customize T-Shirt:
1. Visit `/customize` page
2. **Choose T-Shirt**:
   - Select fit (Regular/Oversized)
   - Pick base color
3. **Switch to Front View**:
   - Upload personal photo (optional)
   - Select admin design graphic (optional)
   - Add text (optional)
4. **Switch to Back View**:
   - Upload personal photo (optional)
   - Select admin design graphic (optional)
   - Add text (optional)
5. **Position elements** by dragging
6. **Review pricing** in summary
7. **Add to Cart**

## Pricing Structure

| Item | Price |
|------|-------|
| Base T-Shirt | ₹599 |
| Personal Photo (front or back) | +₹150 |
| Admin Design (front or back) | +₹100 |
| Custom Text (front or back) | +₹50 |

**Example Prices:**
- Base only: ₹599
- Base + Photo front: ₹749
- Base + Photo front + Design front: ₹849
- Base + Photo both + Design both + Text both: ₹1,149

## Technical Implementation

### Frontend (`Customize2D_new.tsx`):
```typescript
// State for user photos
const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
const [backPhoto, setBackPhoto] = useState<string | null>(null);

// State for admin designs
const [selectedFrontDesign, setSelectedFrontDesign] = useState<Design | null>(null);
const [selectedBackDesign, setSelectedBackDesign] = useState<Design | null>(null);

// Render both on canvas
{currentPhoto && <img src={currentPhoto} zIndex={1} />}
{currentDesignImage && <img src={currentDesignImage} zIndex={2} />}
```

### Backend (Already Implemented):
- Product model has `customizable: Boolean` field
- Design routes at `/api/designs`
- Upload middleware for file handling

### CMS (Already Implemented):
- Products page has "Allow Customization" checkbox
- Designs page for uploading graphics

## File Structure

```
Customization Page Sections:
├── T-Shirt Viewer (Canvas)
│   ├── T-shirt base with color
│   ├── User photo (background)
│   ├── Admin design (foreground)
│   └── Custom text (top)
├── Controls Panel
│   ├── Fit Selector (Regular/Oversized)
│   ├── Color Picker
│   ├── Text Customization
│   ├── Photo Upload Section ⭐ NEW
│   │   ├── File input
│   │   ├── Preview thumbnail
│   │   └── Remove button
│   ├── Admin Design Selection ⭐ UPDATED
│   │   ├── Design gallery grid
│   │   ├── Click to select
│   │   └── Remove button
│   └── Pricing Summary
│       ├── Base price
│       ├── Photo charge
│       ├── Design charge
│       ├── Text charge
│       └── Total
```

## Key Differences from Previous Version

### Before:
- ❌ Only admin designs OR user uploads (one or the other)
- ❌ Confusing which is which

### Now:
- ✅ **Both** user photos AND admin designs
- ✅ Clear separation: "Upload Your Photo" vs "Add Admin Design"
- ✅ Visual distinction: Blue border (photos) vs Gold border (designs)
- ✅ Layer system: Photos behind, designs on top
- ✅ Separate pricing for each

## Use Cases

### Use Case 1: Personal Photo Only
User uploads their family photo on front, leaves back blank.
- **Price**: ₹599 + ₹150 = ₹749

### Use Case 2: Admin Design Only
User selects cool graphic from admin designs for front.
- **Price**: ₹599 + ₹100 = ₹699

### Use Case 3: Photo + Design Combo
User uploads photo as background, adds admin logo design on top.
- **Price**: ₹599 + ₹150 + ₹100 = ₹849

### Use Case 4: Full Customization
User uploads photos (both sides), adds designs (both sides), adds text (both sides).
- **Price**: ₹599 + ₹150 + ₹100 + ₹50 = ₹899 per side × 2 = ₹1,149

## Testing Checklist

- [ ] Admin can mark products as customizable in CMS
- [ ] Admin can upload design graphics in CMS
- [ ] User can upload personal photo for front
- [ ] User can upload personal photo for back
- [ ] User can select admin design for front
- [ ] User can select admin design for back
- [ ] Photo appears behind design (correct z-index)
- [ ] Photo has blue border, design has gold border
- [ ] Both photo and design can be dragged
- [ ] Pricing updates correctly for each option
- [ ] Can remove photo independently
- [ ] Can remove design independently
- [ ] Add to cart includes all customization data
- [ ] Frontend dev server restart shows changes

## Environment Setup (Localhost)

1. **Create `.env` files** (copy from `.env.example`):
   - `backend/.env`
   - `frontend/.env`
   - `tropical-cms/.env`

2. **Start all services**:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend (MUST RESTART to see changes!)
   cd frontend && npm run dev
   
   # CMS
   cd tropical-cms && npm run dev
   ```

3. **Test flow**:
   - Upload designs in CMS
   - Mark product as customizable
   - Visit `/customize` in frontend
   - Upload photo + select design
   - Verify both appear on canvas

## Summary

The customization page now offers a **hybrid approach**:
- **Personal touch**: Users upload their own photos
- **Professional graphics**: Users choose from admin-curated designs
- **Complete freedom**: Combine photos, designs, and text
- **Clear pricing**: Transparent costs for each option
- **Visual clarity**: Color-coded borders distinguish photo from design
