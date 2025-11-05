const express = require('express');
const router = express.Router();
const emailService = require('../services/email.service');

// Test endpoint to verify email configuration
router.get('/test', async (req, res) => {
  try {
    const testResult = {
      configured: !!emailService.transporter,
      verified: emailService.isVerified,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        email: process.env.SMTP_EMAIL,
        hasPassword: !!process.env.SMTP_PASSWORD,
        adminEmail: process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL
      }
    };

    if (!emailService.transporter) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured',
        details: testResult
      });
    }

    if (!emailService.isVerified) {
      return res.status(500).json({
        success: false,
        message: 'Email service not verified - check server logs for details',
        details: testResult
      });
    }

    res.json({
      success: true,
      message: 'Email service is configured and verified',
      details: testResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking email service',
      error: error.message
    });
  }
});

// Send a test welcome email
router.post('/test/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    console.log(`\n🧪 TEST: Sending welcome email to ${email}...`);
    const result = await emailService.sendWelcomeEmail({ email, name });

    if (result.success) {
      return res.json({
        success: true,
        message: 'Test welcome email sent successfully',
        details: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test welcome email',
        details: result
      });
    }
  } catch (error) {
    console.error('Test welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

// Send a test contact email
router.post('/test/contact', async (req, res) => {
  try {
    const { email, name, message } = req.body;

    if (!email || !name || !message) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, and message are required'
      });
    }

    console.log(`\n🧪 TEST: Sending contact email from ${name} (${email})...`);
    const result = await emailService.sendContactMessage({ email, name, message });

    if (result.success) {
      return res.json({
        success: true,
        message: 'Test contact email sent successfully',
        details: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test contact email',
        details: result
      });
    }
  } catch (error) {
    console.error('Test contact email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

// Force re-verify SMTP connection
router.post('/verify', async (req, res) => {
  try {
    console.log('\n🔄 Forcing SMTP connection verification...');
    const verified = await emailService.verifyConnection();

    res.json({
      success: verified,
      message: verified 
        ? 'Email service verified successfully' 
        : 'Email service verification failed - check server logs',
      verified: emailService.isVerified
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying email service',
      error: error.message
    });
  }
});

module.exports = router;
