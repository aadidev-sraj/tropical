# Fix Localhost Images in Database

## The Problem

Your database has images stored as:
```
http://localhost:5000/uploads/image.png
```

Instead of:
```
/uploads/image.png
```

This is why even after setting the correct API URL, images still try to load from localhost.

## Solution 1: Database Migration Script (Recommended)

Create and run this script to fix all existing images in the database:

**File**: `backend/fix-image-urls.js`

```javascript
require('dotenv').config();
const mongoose = require('mongoose');

async function fixImageUrls() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tropical');
    console.log('Connected to MongoDB');

    // Get all models
    const Product = require('./src/models/product.model');
    const Design = require('./src/models/design.model');
    const Hero = require('./src/models/hero.model');
    const Featured = require('./src/models/featured.model');

    let totalFixed = 0;

    // Fix Products
    console.log('\n🔧 Fixing Product images...');
    const products = await Product.find({});
    for (const product of products) {
      let changed = false;
      if (product.images && product.images.length > 0) {
        product.images = product.images.map(img => {
          if (img.includes('localhost') || img.includes('http://') || img.includes('https://')) {
            changed = true;
            // Extract just the /uploads/filename.png part
            const match = img.match(/\/uploads\/[^?]+/);
            return match ? match[0] : img;
          }
          return img;
        });
      }
      if (changed) {
        await product.save();
        totalFixed++;
        console.log(`  ✓ Fixed: ${product.name}`);
      }
    }

    // Fix Designs
    console.log('\n🔧 Fixing Design images...');
    const designs = await Design.find({});
    for (const design of designs) {
      if (design.imageUrl && (design.imageUrl.includes('localhost') || design.imageUrl.includes('http://') || design.imageUrl.includes('https://'))) {
        const match = design.imageUrl.match(/\/uploads\/[^?]+/);
        design.imageUrl = match ? match[0] : design.imageUrl;
        await design.save();
        totalFixed++;
        console.log(`  ✓ Fixed: ${design.name}`);
      }
    }

    // Fix Hero sections
    console.log('\n🔧 Fixing Hero images...');
    const heroes = await Hero.find({});
    for (const hero of heroes) {
      if (hero.backgroundImage && (hero.backgroundImage.includes('localhost') || hero.backgroundImage.includes('http://') || hero.backgroundImage.includes('https://'))) {
        const match = hero.backgroundImage.match(/\/uploads\/[^?]+/);
        hero.backgroundImage = match ? match[0] : hero.backgroundImage;
        await hero.save();
        totalFixed++;
        console.log(`  ✓ Fixed: ${hero.title}`);
      }
    }

    // Fix Featured items
    console.log('\n🔧 Fixing Featured images...');
    const featured = await Featured.find({});
    for (const item of featured) {
      let changed = false;
      if (item.images && item.images.length > 0) {
        item.images = item.images.map(img => {
          if (img.includes('localhost') || img.includes('http://') || img.includes('https://')) {
            changed = true;
            const match = img.match(/\/uploads\/[^?]+/);
            return match ? match[0] : img;
          }
          return img;
        });
      }
      if (changed) {
        await item.save();
        totalFixed++;
        console.log(`  ✓ Fixed featured item`);
      }
    }

    console.log(`\n✅ Migration complete! Fixed ${totalFixed} items.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixImageUrls();
```

### Run the Migration

```bash
cd backend
node fix-image-urls.js
```

---

## Solution 2: Manual Database Update (MongoDB Compass/Shell)

If you prefer to update manually:

### Using MongoDB Compass:
1. Connect to your database
2. For each collection (products, designs, heroes, featured):
3. Find documents with `localhost` in image URLs
4. Replace with relative paths

### Using MongoDB Shell:
```javascript
// Connect to your database
use tropical

// Fix Products
db.products.find().forEach(function(doc) {
  if (doc.images) {
    doc.images = doc.images.map(img => {
      if (img.includes('localhost')) {
        return img.replace(/^https?:\/\/[^\/]+/, '');
      }
      return img;
    });
    db.products.save(doc);
  }
});

// Fix Designs
db.designs.find().forEach(function(doc) {
  if (doc.imageUrl && doc.imageUrl.includes('localhost')) {
    doc.imageUrl = doc.imageUrl.replace(/^https?:\/\/[^\/]+/, '');
    db.designs.save(doc);
  }
});

// Fix Heroes
db.heroes.find().forEach(function(doc) {
  if (doc.backgroundImage && doc.backgroundImage.includes('localhost')) {
    doc.backgroundImage = doc.backgroundImage.replace(/^https?:\/\/[^\/]+/, '');
    db.heroes.save(doc);
  }
});

// Fix Featured
db.featureds.find().forEach(function(doc) {
  if (doc.images) {
    doc.images = doc.images.map(img => {
      if (img.includes('localhost')) {
        return img.replace(/^https?:\/\/[^\/]+/, '');
      }
      return img;
    });
    db.featureds.save(doc);
  }
});
```

---

## Solution 3: Re-upload Images via Deployed CMS

The simplest but most time-consuming:

1. Go to your deployed CMS: `https://tropical-cms.onrender.com` (or wherever it's deployed)
2. Edit each product/design
3. Delete the old image
4. Re-upload the image
5. Save

The new uploads will use relative paths (because we fixed the CMS code earlier).

---

## Will Cloudinary Fix This?

**YES!** Cloudinary will fix this because:
- Cloudinary returns full URLs like `https://res.cloudinary.com/...`
- These URLs work everywhere (no localhost issues)
- No need for relative path conversion
- Images persist forever

But you still need to:
1. Set up Cloudinary (see `CLOUD_STORAGE_MIGRATION.md`)
2. Re-upload all images via CMS

---

## Recommended Steps (In Order)

### Step 1: Run Database Migration
```bash
cd backend
node fix-image-urls.js
```

### Step 2: Verify Frontend .env Exists
Make sure `frontend/.env` has:
```env
VITE_API_BASE=https://tropical-backend.onrender.com/api
```

### Step 3: Rebuild Frontend
```bash
cd frontend
npm run build
```

### Step 4: Redeploy Frontend
Deploy the new `dist` folder

### Step 5: Test
Open deployed frontend and check if images load

---

## Quick Fix Commands

```bash
# 1. Create the migration script
cd backend
# Copy the script above into fix-image-urls.js

# 2. Run migration
node fix-image-urls.js

# 3. Rebuild frontend with correct env
cd ../frontend
npm run build

# 4. Redeploy
# Deploy the dist folder to your hosting
```

---

## After Migration

Images will load as:
```
https://tropical-backend.onrender.com/uploads/image.png
```

Instead of:
```
http://localhost:5000/uploads/image.png
```

✅ No more mixed content errors
✅ Images load correctly
✅ HTTPS everywhere
