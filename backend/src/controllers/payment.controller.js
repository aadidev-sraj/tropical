const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/order.model');
const emailService = require('../services/email.service');

class PaymentController {
  constructor() {
    this.razorpay = null;
    
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
      console.log('✓ Razorpay initialized successfully');
    } else {
      console.warn('⚠ Razorpay credentials not configured. Payment features will be disabled.');
    }
  }

  // Create Razorpay order
  createOrder = async (req, res) => {
    try {
      if (!this.razorpay) {
        return res.status(503).json({
          success: false,
          message: 'Payment service not configured'
        });
      }

      const { amount, currency = 'INR', receipt, notes } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      // Create Razorpay order
      const options = {
        amount: Math.round(amount * 100), // Amount in paise (smallest currency unit)
        currency,
        receipt: receipt || `order_${Date.now()}`,
        notes: notes || {}
      };

      const razorpayOrder = await this.razorpay.orders.create(options);

      res.status(200).json({
        success: true,
        data: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID
        }
      });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: error.message
      });
    }
  };

  // Verify payment signature
  verifyPayment = async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderData
      } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing payment verification parameters'
        });
      }

      // Verify signature
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

      if (razorpay_signature !== expectedSign) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      // Payment verified successfully, create order in database
      if (orderData) {
        // Generate composite images for customized items
        const imageCompositeService = require('../services/image-composite.service');
        
        for (let item of orderData.items) {
          if (item.customization && item.customization.productImages) {
            try {
              const compositeImages = await imageCompositeService.createCustomizationImages(
                item.customization,
                item.customization.productImages,
                item.productId
              );
              
              // Replace screenshot URLs with composite URLs
              if (compositeImages.frontImageUrl) {
                item.customization.frontImageUrl = compositeImages.frontImageUrl;
              }
              if (compositeImages.backImageUrl) {
                item.customization.backImageUrl = compositeImages.backImageUrl;
              }
            } catch (error) {
              console.error('Failed to generate composite images:', error);
              // Continue with original images if composite fails
            }
          }
        }
        
        const order = new Order({
          user: req.user._id,
          items: orderData.items,
          customerInfo: orderData.customerInfo,
          pricing: orderData.pricing,
          paymentStatus: 'paid',
          paymentDetails: {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
          }
        });

        await order.save();

        // Send email notifications
        const orderNotificationData = {
          customerInfo: order.customerInfo,
          orderNumber: order.orderNumber,
          items: order.items,
          pricing: order.pricing
        };

        // Send customer email
        const emailResult = await emailService.sendOrderConfirmationEmail(orderNotificationData);
        console.log('Customer email notification:', emailResult.success ? '✓ Sent' : '✗ Failed');

        // Send admin email
        const adminNotificationResult = await emailService.sendAdminOrderNotification(orderNotificationData);
        console.log('Admin email notification:', adminNotificationResult.success ? '✓ Sent' : '✗ Failed');

        // Update order with email notification status
        if (emailResult.success) {
          order.emailNotificationSent = true;
          order.emailNotificationSentAt = new Date();
          await order.save();
        }

        return res.status(200).json({
          success: true,
          message: 'Payment verified and order created successfully',
          data: {
            order,
            notifications: {
              customer: emailResult,
              admin: adminNotificationResult
            }
          }
        });
      }

      // If no order data, just verify payment
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment',
        error: error.message
      });
    }
  };

  // Webhook handler for Razorpay events
  handleWebhook = async (req, res) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      
      if (webhookSecret) {
        const signature = req.headers['x-razorpay-signature'];
        const body = JSON.stringify(req.body);

        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(body)
          .digest('hex');

        if (signature !== expectedSignature) {
          return res.status(400).json({
            success: false,
            message: 'Invalid webhook signature'
          });
        }
      }

      const event = req.body.event;
      const payload = req.body.payload;

      console.log('Razorpay webhook event:', event);

      // Handle different webhook events
      switch (event) {
        case 'payment.captured':
          // Payment was successfully captured
          console.log('Payment captured:', payload.payment.entity.id);
          // You can update order status here if needed
          break;

        case 'payment.failed':
          // Payment failed
          console.log('Payment failed:', payload.payment.entity.id);
          break;

        case 'order.paid':
          // Order was paid
          console.log('Order paid:', payload.order.entity.id);
          break;

        default:
          console.log('Unhandled webhook event:', event);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      });
    }
  };

  // Get payment details
  getPaymentDetails = async (req, res) => {
    try {
      if (!this.razorpay) {
        return res.status(503).json({
          success: false,
          message: 'Payment service not configured'
        });
      }

      const { paymentId } = req.params;

      const payment = await this.razorpay.payments.fetch(paymentId);

      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Error fetching payment details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details',
        error: error.message
      });
    }
  };
}

module.exports = new PaymentController();
