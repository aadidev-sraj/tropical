const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const emailService = require('../services/email.service');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || ''
    });

    // Generate token
    const token = generateToken(user._id);

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail({
      name: user.name,
      email: user.email
    }).then(result => {
      console.log('Welcome email:', result.success ? '✓ Sent' : '✗ Failed');
    }).catch(err => {
      console.error('Welcome email error:', err);
    });

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    // 'identifier' can be an email address or a phone number
    const { identifier, email, password } = req.body;
    const loginId = identifier || email; // accept both field names for backward compat

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Please provide an email/phone and password' });
    }

    // Try to find the user by email first, then by phone number
    let user = await User.findOne({ email: loginId.toLowerCase() }).select('+password');

    if (!user) {
      // Strip spaces/dashes so "98765 43210" matches "9876543210"
      const normalizedPhone = loginId.replace(/[\s\-]/g, '');
      user = await User.findOne({ phone: normalizedPhone }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};
