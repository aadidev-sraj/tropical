const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    // 'fixed' = flat ₹ amount added per order
    // 'percentage' = % of order subtotal (items total, before shipping)
    shippingFeeType: {
      type: String,
      enum: ['fixed', 'percentage'],
      default: 'fixed',
    },
    customizationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Settings', settingsSchema);

