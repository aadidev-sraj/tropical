const express = require('express');
const router = express.Router();
const Contact = require('../models/contact.model');
const { protect, admin } = require('../middleware/auth.middleware');

// Get all contact messages (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Contact.countDocuments(query);
    
    res.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update contact status (admin only)
router.patch('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    res.json({ success: true, data: contact });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete contact (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
