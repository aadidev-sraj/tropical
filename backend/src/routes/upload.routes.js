const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const path = require('path');
const fs = require('fs');

// Upload single image (admin only)
router.post('/single', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Return the URL path to access the image
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'File uploaded successfully',
    data: { url: imageUrl },
    url: imageUrl,
    filename: req.file.filename
  });
});

// Upload customization image (authenticated users)
router.post('/customization', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Return the URL path to access the image
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'Customization image uploaded successfully',
    data: { url: imageUrl },
    url: imageUrl,
    filename: req.file.filename
  });
});

// Generate composite image (authenticated users)
router.post('/composite', protect, async (req, res) => {
  try {
    const imageCompositeService = require('../services/image-composite.service');
    const { productImageUrl, designImageUrl, position, size, outputFilename } = req.body;
    
    if (!productImageUrl || !designImageUrl || !position || !size || !outputFilename) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const compositeUrl = await imageCompositeService.compositeImage({
      productImageUrl,
      designImageUrl,
      position,
      size,
      outputFilename
    });
    
    res.json({
      message: 'Composite image created successfully',
      data: { url: compositeUrl },
      url: compositeUrl
    });
  } catch (error) {
    console.error('Composite image error:', error);
    res.status(500).json({ message: 'Failed to create composite image', error: error.message });
  }
});

// Upload multiple images
router.post('/multiple', protect, adminOnly, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  
  const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
  res.json({
    message: 'Files uploaded successfully',
    urls: imageUrls,
    count: req.files.length
  });
});

// Delete an image (admin only)
router.delete('/:filename', protect, adminOnly, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads', filename);
  
  // Security check: ensure filename doesn't contain path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ message: 'Invalid filename' });
  }
  
  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ message: 'File not found' });
      }
      return res.status(500).json({ message: 'Error deleting file' });
    }
    res.json({ message: 'File deleted successfully' });
  });
});

module.exports = router;
