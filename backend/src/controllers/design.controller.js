const Design = require('../models/design.model');

// Get all designs
exports.getAllDesigns = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const designs = await Design.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: designs });
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch designs' });
  }
};

// Get single design
exports.getDesignById = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }
    res.json({ success: true, data: design });
  } catch (error) {
    console.error('Get design error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch design' });
  }
};

// Create design
exports.createDesign = async (req, res) => {
  try {
    const { name, description, imageUrl, category, tags, applicableCategories } = req.body;
    
    if (!name || !imageUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and image URL are required' 
      });
    }
    
    const design = new Design({
      name,
      description,
      imageUrl,
      category: category || 'graphic',
      tags: tags || [],
      applicableCategories: applicableCategories || ['all'],
      isActive: true
    });
    
    await design.save();
    res.status(201).json({ success: true, data: design });
  } catch (error) {
    console.error('Create design error:', error);
    res.status(500).json({ success: false, message: 'Failed to create design' });
  }
};

// Update design
exports.updateDesign = async (req, res) => {
  try {
    const { name, description, imageUrl, category, tags, isActive, applicableCategories } = req.body;
    
    const design = await Design.findByIdAndUpdate(
      req.params.id,
      { name, description, imageUrl, category, tags, isActive, applicableCategories },
      { new: true, runValidators: true }
    );
    
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }
    
    res.json({ success: true, data: design });
  } catch (error) {
    console.error('Update design error:', error);
    res.status(500).json({ success: false, message: 'Failed to update design' });
  }
};

// Delete design
exports.deleteDesign = async (req, res) => {
  try {
    const design = await Design.findByIdAndDelete(req.params.id);
    
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }
    
    res.json({ success: true, message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Delete design error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete design' });
  }
};
