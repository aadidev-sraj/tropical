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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
