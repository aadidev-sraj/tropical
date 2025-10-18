const mongoose = require('mongoose');

const HeroSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    buttonText: { type: String, default: 'Shop Now' },
    buttonLink: { type: String, default: '/products' },
    backgroundImage: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hero', HeroSchema);
