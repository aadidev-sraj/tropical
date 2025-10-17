const Order = require('../models/order.model');
const User = require('../models/user.model');
const emailService = require('../services/email.service');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { items, customerInfo, pricing } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer information is required (name, email, phone)'
      });
    }

    if (!pricing || typeof pricing.subtotal !== 'number' || typeof pricing.total !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Pricing information is required'
      });
    }

    // Create the order
    const order = new Order({
      user: req.user._id,
      items,
      customerInfo,
      pricing,
      paymentStatus: 'paid' // Assuming payment is completed before order creation
    });

    await order.save();

    // Prepare order data for notifications
    const orderNotificationData = {
      customerInfo: order.customerInfo,
      orderNumber: order.orderNumber,
      items: order.items,
      pricing: order.pricing
    };

    // Send email notification to customer
    const emailResult = await emailService.sendOrderConfirmationEmail(orderNotificationData);
    console.log('Customer email notification:', emailResult.success ? '✓ Sent' : '✗ Failed');

    // Send email notification to admin
    const adminNotificationResult = await emailService.sendAdminOrderNotification(orderNotificationData);
    console.log('Admin email notification:', adminNotificationResult.success ? '✓ Sent' : '✗ Failed');

    // Update order with email notification status
    if (emailResult.success) {
      order.emailNotificationSent = true;
      order.emailNotificationSentAt = new Date();
      await order.save();
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Email confirmations sent!',
      data: {
        order,
        notifications: {
          customer: emailResult,
          admin: adminNotificationResult
        }
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get all orders for the logged-in user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Note: Email notification for status updates can be added here if needed
    // For now, only order creation sends email notifications

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Resend email notification
exports.resendEmailNotification = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const emailResult = await emailService.sendOrderConfirmationEmail({
      customerInfo: order.customerInfo,
      orderNumber: order.orderNumber,
      items: order.items,
      pricing: order.pricing
    });

    if (emailResult.success) {
      order.emailNotificationSent = true;
      order.emailNotificationSentAt = new Date();
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: 'Email notification resent',
      data: emailResult
    });
  } catch (error) {
    console.error('Error resending email notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend email notification',
      error: error.message
    });
  }
};
