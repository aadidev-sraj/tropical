const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Public routes
router.get('/', ctrl.list);
router.get('/:idOrSlug', ctrl.getOne);

// Admin routes
router.post('/', protect, adminOnly, ctrl.create);
router.put('/:id', protect, adminOnly, ctrl.update);
router.delete('/:id', protect, adminOnly, ctrl.remove);

module.exports = router;
