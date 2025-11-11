const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth.middleware');
const { getSettings, updateSettings } = require('../controllers/settings.controller');

// Public: allow store frontend to load fees without auth
router.get('/', getSettings);

// Admin: allow updating fees
router.put('/', auth, authorize('admin'), updateSettings);

module.exports = router;
