const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }],
    sizes: [{ 
      type: String, 
      enum: ['S', 'M', 'L', 'XL', 'XXL'],
      uppercase: true 
    }],
    category: { 
      type: String, 
      enum: ['tshirts', 'shirts', 'jeans', 'hoodies', 'pants', 'other'],
      default: 'other',
      lowercase: true
    },
    customizable: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
