const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth.middleware');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  resendEmailNotification
} = require('../controllers/order.controller');

// User routes (require authentication)
router.post('/', auth, createOrder);
router.get('/my-orders', auth, getUserOrders);
router.get('/:id', auth, getOrderById);
router.post('/:id/resend-notification', auth, resendEmailNotification);

// Admin routes (require authentication and admin role)
router.get('/', auth, authorize('admin'), getAllOrders);
router.patch('/:id/status', auth, authorize('admin'), updateOrderStatus);

module.exports = router;
