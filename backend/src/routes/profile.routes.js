const express = require('express');
const { check } = require('express-validator');
const { 
  getProfile, 
  updateProfile, 
  updatePassword,
  manageAddress,
  deleteAddress
} = require('../controllers/profile.controller');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/', getProfile);

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Please include a valid phone number').optional().isMobilePhone()
  ],
  updateProfile
);

// @route   PUT /api/profile/password
// @desc    Update user password
// @access  Private
router.put(
  '/password',
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'Please enter a password with 8 or more characters').isLength({ min: 8 })
  ],
  updatePassword
);

// @route   POST /api/profile/address
// @desc    Add or update address
// @access  Private
router.post(
  '/address',
  [
    check('street', 'Street is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
    check('state', 'State is required').not().isEmpty(),
    check('country', 'Country is required').not().isEmpty(),
    check('zipCode', 'ZIP code is required').not().isEmpty()
  ],
  manageAddress
);

// @route   DELETE /api/profile/address/:id
// @desc    Delete address
// @access  Private
router.delete('/address/:id', deleteAddress);

module.exports = router;
