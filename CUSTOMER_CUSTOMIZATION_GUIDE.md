# Customer Customization System - Implementation Guide

## Overview

The customization system has been updated to allow **customers to upload their own designs** and position them freely on products. When an order is placed, the customized product images are automatically sent to the admin via email.

## Key Changes

### 1. **Customer Upload Flow** (NEW)
- ✅ Customers can now upload their own design images
- ✅ Drag-and-drop positioning on the product
- ✅ Resize and rotate controls
- ✅ Separate front and back customization
- ✅ Real-time canvas preview

### 2. **Admin Design System** (REMOVED from customer flow)
- ❌ Customers no longer select from admin-uploaded designs
- ℹ️ The design management in CMS is now optional/deprecated
- ℹ️ You can keep it for internal reference or remove it

### 3. **Email Notifications** (ENHANCED)
- ✅ Customer receives order confirmation with their customization
- ✅ Admin receives order notification with:
  - Customer-uploaded design images (as attachments)
  - Design positioning details (X, Y coordinates, size, rotation)
  - Product preview image

## How It Works

### Customer Experience

1. **Browse Products**: Customer visits `/customize` to see customizable products
2. **Select Product**: Click "Customize" on any product
3. **Upload Design**: 
   - Click the upload area
   - Select an image file (PNG, JPG, up to 5MB)
   - Design appears on the product preview
4. **Position Design**:
   - **Drag**: Click and drag the design to move it
   - **Resize**: Use "Smaller" / "Larger" buttons
   - **Rotate**: Use rotation buttons (15° increments)
5. **Switch Views**: Toggle between Front and Back to customize both sides
6. **Select Size**: Choose product size (if applicable)
7. **Add to Cart**: Customization data is saved with the cart item
8. **Checkout**: Complete payment
9. **Order Confirmation**: Receive email with customization preview

### Admin Experience

When a customer places an order with customization:

1. **Email Notification**: Admin receives email at `ADMIN_EMAIL` (from .env)
2. **Email Contains**:
   - Order details (customer info, items, pricing)
   - **Customization section** with:
     - Front design image (if uploaded)
     - Back design image (if uploaded)
     - Position details: `X: 25.0% Y: 30.5% | Size: 50.0x50.0% | Rotation: 15°`
   - All images attached as PNG files
3. **Production**: Use the attached images and positioning data to produce the customized product

## Technical Details

### Frontend (`CustomizeProduct.tsx`)

**State Management**:
```typescript
type CustomDesign = {
  imageUrl: string;      // Base64 data URL
  x: number;             // X position (0-100%)
  y: number;             // Y position (0-100%)
  width: number;         // Width (0-100%)
  height: number;        // Height (0-100%)
  rotation: number;      // Rotation in degrees
};
```

**Cart Item Structure**:
```typescript
{
  customization: {
    frontDesign: CustomDesign | null,
    backDesign: CustomDesign | null,
    previewUrl: string  // Canvas screenshot
  }
}
```

### Backend (`email.service.js`)

**Handles Two Formats**:
1. **New Format** (Customer Upload):
   ```javascript
   item.customization.frontDesign = {
     imageUrl: "data:image/png;base64,...",
     x: 25, y: 30, width: 50, height: 50, rotation: 15
   }
   ```

2. **Old Format** (Admin Design - backward compatible):
   ```javascript
   item.customization.frontImageUrl = "/uploads/design.png"
   ```

**Email Attachments**:
- Base64 images are decoded and attached as PNG files
- File naming: `{ProductName}-front-{index}.png`

## Configuration

### Environment Variables

**Backend** (`.env`):
```env
# Email Configuration (Required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@thetropical.in

# Backend URL (for image URLs in emails)
BACKEND_URL=https://tropical-backend.onrender.com
```

**Frontend** (`.env`):
```env
# Backend API
VITE_API_BASE=https://tropical-backend.onrender.com/api
```

## Pricing

Current pricing structure in `CustomizeProduct.tsx`:
- **Base Product**: Original product price
- **Customization Fee**: ₹200 (flat fee for custom design)

To modify pricing, edit:
```typescript
// Line ~290 in CustomizeProduct.tsx
const customizationFee = 200;
const price = product.price + customizationFee;
```

## File Structure

```
frontend/src/pages/
├── CustomizeProduct.tsx          # NEW: Customer upload system
├── CustomizeProduct_v2.tsx       # OLD: Admin design selection (deprecated)
├── CustomizeProduct_new.tsx      # OLD: Alternative version (deprecated)
└── CustomizableProducts.tsx      # Product listing page

backend/src/
├── services/email.service.js     # Updated: Handles both formats
└── controllers/order.controller.js  # Unchanged: Uses email service
```

## Migration Notes

### If You Want to Remove Admin Design Management:

1. **CMS**: The Designs page in CMS can be hidden or removed
2. **Backend**: Keep the design routes for backward compatibility
3. **Database**: Existing design data won't affect new orders

### If You Want to Keep Both Systems:

The email service supports both formats, so:
- Old orders with admin designs will still work
- New orders with customer uploads will work
- You can offer both options if needed

## Testing Checklist

- [ ] Customer can upload PNG/JPG images
- [ ] Drag-and-drop positioning works
- [ ] Resize and rotate controls function
- [ ] Front and back views are independent
- [ ] Canvas preview renders correctly
- [ ] Add to cart saves customization data
- [ ] Order email to customer includes preview
- [ ] Order email to admin includes:
  - [ ] Design images as attachments
  - [ ] Position/size/rotation details
  - [ ] Readable formatting

## Troubleshooting

### Images Not Showing in Email
- Check `SMTP_*` variables are set correctly
- Verify `ADMIN_EMAIL` is configured
- Check email spam folder
- Test with Gmail (most reliable for base64 images)

### Design Not Rendering on Canvas
- Ensure image file is under 5MB
- Check browser console for CORS errors
- Verify image format is PNG or JPG

### Positioning Inaccurate
- The positioning is percentage-based (0-100%)
- Admin should use the provided coordinates to place the design
- Consider creating a production template with grid overlay

## Future Enhancements

Potential improvements:
- [ ] Text overlay option
- [ ] Multiple designs per side
- [ ] Color picker for design
- [ ] Preset templates
- [ ] 3D product preview
- [ ] Design library (save/reuse designs)
- [ ] Admin production dashboard with visual preview

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment variables
3. Test email service with a simple order
4. Review email service logs in backend console
