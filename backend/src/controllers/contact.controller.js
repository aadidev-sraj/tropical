const emailService = require('../services/email.service');

exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const result = await emailService.sendContactMessage({ name, email, message });

    if (!result.success) {
      return res.status(500).json({ success: false, message: result.message || 'Failed to send message' });
    }

    return res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Contact send error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
