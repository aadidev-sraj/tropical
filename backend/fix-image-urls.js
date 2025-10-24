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
