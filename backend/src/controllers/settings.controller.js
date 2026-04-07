const Settings = require('../models/settings.model');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { shippingFee, shippingFeeType, customizationFee } = req.body;

    // Validate numeric fields
    if (
      (shippingFee !== undefined && typeof shippingFee !== 'number') ||
      (customizationFee !== undefined && typeof customizationFee !== 'number')
    ) {
      return res.status(400).json({
        success: false,
        message: 'shippingFee and customizationFee must be numbers',
      });
    }

    // Validate fee type
    if (shippingFeeType !== undefined && !['fixed', 'percentage'].includes(shippingFeeType)) {
      return res.status(400).json({
        success: false,
        message: "shippingFeeType must be 'fixed' or 'percentage'",
      });
    }

    // Percentage value sanity check (0–100)
    if (shippingFeeType === 'percentage' && shippingFee !== undefined && shippingFee > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage shipping fee cannot exceed 100%',
      });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (shippingFee !== undefined) settings.shippingFee = Math.max(shippingFee, 0);
    if (shippingFeeType !== undefined) settings.shippingFeeType = shippingFeeType;
    if (customizationFee !== undefined) settings.customizationFee = Math.max(customizationFee, 0);

    if (req.user) {
      settings.updatedBy = req.user._id;
    }

    await settings.save();

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

