const Hero = require('../models/hero.model');

// GET /api/hero - Get active hero section
exports.getActive = async (req, res, next) => {
  try {
    const hero = await Hero.findOne({ active: true }).sort({ createdAt: -1 }).lean();
    if (!hero) {
      // Return default hero if none exists
      return res.json({
        data: {
          title: 'Welcome to The Tropical',
          subtitle: 'Discover our amazing collection',
          buttonText: 'Shop Now',
          buttonLink: '/products',
          backgroundImage: null
        }
      });
    }
    res.json({ data: hero });
  } catch (err) {
    next(err);
  }
};

// GET /api/hero/all - Get all hero sections (Admin only)
exports.list = async (req, res, next) => {
  try {
    const heroes = await Hero.find().sort({ createdAt: -1 }).lean();
    res.json({ data: heroes });
  } catch (err) {
    next(err);
  }
};

// POST /api/hero - Create hero section (Admin only)
exports.create = async (req, res, next) => {
  try {
    const { title, subtitle, buttonText, buttonLink, backgroundImage, active } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // If setting as active, deactivate others
    if (active) {
      await Hero.updateMany({}, { active: false });
    }
    
    const hero = new Hero({
      title,
      subtitle: subtitle || '',
      buttonText: buttonText || 'Shop Now',
      buttonLink: buttonLink || '/products',
      backgroundImage: backgroundImage || null,
      active: active !== undefined ? active : true
    });
    
    await hero.save();
    res.status(201).json({ data: hero });
  } catch (err) {
    next(err);
  }
};

// PUT /api/hero/:id - Update hero section (Admin only)
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, subtitle, buttonText, buttonLink, backgroundImage, active } = req.body;
    
    const hero = await Hero.findById(id);
    if (!hero) {
      return res.status(404).json({ message: 'Hero section not found' });
    }
    
    // If setting as active, deactivate others
    if (active && !hero.active) {
      await Hero.updateMany({ _id: { $ne: id } }, { active: false });
    }
    
    // Update fields
    if (title !== undefined) hero.title = title;
    if (subtitle !== undefined) hero.subtitle = subtitle;
    if (buttonText !== undefined) hero.buttonText = buttonText;
    if (buttonLink !== undefined) hero.buttonLink = buttonLink;
    if (backgroundImage !== undefined) hero.backgroundImage = backgroundImage;
    if (active !== undefined) hero.active = active;
    
    await hero.save();
    res.json({ data: hero });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/hero/:id - Delete hero section (Admin only)
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const hero = await Hero.findByIdAndDelete(id);
    if (!hero) {
      return res.status(404).json({ message: 'Hero section not found' });
    }
    
    res.json({ message: 'Hero section deleted successfully', data: hero });
  } catch (err) {
    next(err);
  }
};
