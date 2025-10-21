const mongoose = require('mongoose');

const DesignSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    imageUrl: { 
      type: String, 
      required: true 
    },
    category: { 
      type: String, 
      enum: ['graphic', 'pattern', 'logo', 'text', 'other'],
      default: 'graphic'
    },
    tags: [{ 
      type: String 
    }],
    isActive: { 
      type: Boolean, 
      default: true 
    },
    // Optional: restrict to specific product categories
    applicableCategories: [{
      type: String,
      enum: ['tshirts', 'shirts', 'jeans', 'hoodies', 'pants', 'other', 'all']
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Design', DesignSchema);
