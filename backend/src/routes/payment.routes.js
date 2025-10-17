const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentDetails
} = require('../controllers/payment.controller');

// Create Razorpay order (requires authentication)
router.post('/create-order', auth, createOrder);

// Verify payment and create order (requires authentication)
router.post('/verify', auth, verifyPayment);

// Webhook endpoint (no auth required, signature verified in controller)
router.post('/webhook', handleWebhook);

// Get payment details (requires authentication)
router.get('/payment/:paymentId', auth, getPaymentDetails);

module.exports = router;
