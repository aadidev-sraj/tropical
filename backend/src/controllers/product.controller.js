const Product = require('../models/product.model');
const mongoose = require('mongoose');

// Helper function to slugify strings
function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// GET /api/products
exports.list = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json({ data: products });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:idOrSlug
exports.getOne = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let product = null;
    
    // Try by MongoDB _id first if valid ObjectId
    if (mongoose.isValidObjectId(idOrSlug)) {
      product = await Product.findById(idOrSlug).lean();
    }
    
    // Fallback to slug
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug }).lean();
    }
    
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
};

// POST /api/products (Admin only)
exports.create = async (req, res, next) => {
  try {
    const { name, price, description, images, sizes } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    
    const slug = slugify(name);
    
    // Check if slug already exists
    const existing = await Product.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }
    
    const product = new Product({
      name,
      slug,
      price: Number(price),
      description: description || '',
      images: Array.isArray(images) ? images : [],
      sizes: Array.isArray(sizes) ? sizes : []
    });
    
    await product.save();
    res.status(201).json({ data: product });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id (Admin only)
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, description, images, sizes } = req.body;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update fields
    if (name) {
      product.name = name;
      product.slug = slugify(name);
    }
    if (price !== undefined) product.price = Number(price);
    if (description !== undefined) product.description = description;
    if (images !== undefined) product.images = Array.isArray(images) ? images : [];
    if (sizes !== undefined) product.sizes = Array.isArray(sizes) ? sizes : [];
    
    await product.save();
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id (Admin only)
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully', data: product });
  } catch (err) {
    next(err);
  }
};
