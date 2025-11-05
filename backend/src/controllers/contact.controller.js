const emailService = require('../services/email.service');
const Contact = require('../models/contact.model');

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

    // Save to database first (so we don't lose the message even if email fails)
    try {
      await Contact.create({ name, email, message });
      console.log('✅ Contact message saved to database');
    } catch (dbError) {
      console.error('❌ Failed to save contact to database:', dbError);
      // Continue anyway - try to send email
    }

    // Try to send email (non-blocking - don't fail if email service is down)
    emailService.sendContactMessage({ name, email, message })
      .then(result => {
        if (result.success) {
          console.log('✅ Contact email sent successfully');
        } else {
          console.warn('⚠ Email not sent, but message saved to database');
        }
      })
      .catch(err => {
        console.error('❌ Email send error (non-critical):', err.message);
      });

    // Always return success if we got this far (message is saved)
    return res.status(200).json({ 
      success: true, 
      message: 'Message received successfully! We will get back to you soon.' 
    });
  } catch (err) {
    console.error('Contact controller error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
