const mongoose = require('mongoose');

const FeaturedSchema = new mongoose.Schema(
  {
    images: [{ type: String }], // Array of image URLs
    primaryImage: { type: String }, // First image used as stable key
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Featured', FeaturedSchema);
