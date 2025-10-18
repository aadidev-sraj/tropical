const Featured = require('../models/featured.model');
const mongoose = require('mongoose');

// GET /api/featured
exports.list = async (req, res, next) => {
  try {
    const featured = await Featured.find({ active: true }).sort({ order: 1, createdAt: -1 }).lean();
    res.json({ data: featured });
  } catch (err) {
    next(err);
  }
};

// POST /api/featured (Admin only)
exports.create = async (req, res, next) => {
  try {
    const { images, active } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }
    
    const featured = new Featured({
      images,
      primaryImage: images[0],
      active: active !== undefined ? active : true
    });
    
    await featured.save();
    res.status(201).json({ data: featured });
  } catch (err) {
    next(err);
  }
};

// PUT /api/featured/:id (Admin only)
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { images, active } = req.body;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid featured item ID' });
    }
    
    const featured = await Featured.findById(id);
    if (!featured) {
      return res.status(404).json({ message: 'Featured item not found' });
    }
    
    // Update fields
    if (images !== undefined) {
      if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: 'At least one image is required' });
      }
      featured.images = images;
      featured.primaryImage = images[0];
    }
    if (active !== undefined) featured.active = active;
    
    await featured.save();
    res.json({ data: featured });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/featured/:id (Admin only)
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid featured item ID' });
    }
    
    const featured = await Featured.findByIdAndDelete(id);
    if (!featured) {
      return res.status(404).json({ message: 'Featured item not found' });
    }
    
    res.json({ message: 'Featured item deleted successfully', data: featured });
  } catch (err) {
    next(err);
  }
};
