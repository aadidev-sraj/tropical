const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/hero.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Public route
router.get('/', ctrl.getActive);

// Admin routes
router.get('/all', protect, adminOnly, ctrl.list);
router.post('/', protect, adminOnly, ctrl.create);
router.put('/:id', protect, adminOnly, ctrl.update);
router.delete('/:id', protect, adminOnly, ctrl.remove);

module.exports = router;
