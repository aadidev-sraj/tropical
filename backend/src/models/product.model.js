const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }],
    strapiId: { type: Number, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
