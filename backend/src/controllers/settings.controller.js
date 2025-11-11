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
    const { shippingFee, customizationFee } = req.body;

    if (
      (shippingFee !== undefined && typeof shippingFee !== 'number') ||
      (customizationFee !== undefined && typeof customizationFee !== 'number')
    ) {
      return res.status(400).json({
        success: false,
        message: 'shippingFee and customizationFee must be numbers',
      });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    if (shippingFee !== undefined) settings.shippingFee = Math.max(shippingFee, 0);
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
