const express = require('express');
const router = express.Router();
const designController = require('../controllers/design.controller');

// Public routes
router.get('/', designController.getAllDesigns);
router.get('/:id', designController.getDesignById);

// Admin routes (add auth middleware if needed)
router.post('/', designController.createDesign);
router.put('/:id', designController.updateDesign);
router.delete('/:id', designController.deleteDesign);

module.exports = router;
