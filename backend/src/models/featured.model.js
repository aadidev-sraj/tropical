const mongoose = require('mongoose');

const FeaturedSchema = new mongoose.Schema(
  {
    strapiId: { type: Number, unique: true, sparse: true },
    images: [{ type: String }], // Array of image URLs
    primaryImage: { type: String, unique: true, sparse: true }, // First image used as stable key fallback
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Featured', FeaturedSchema);
