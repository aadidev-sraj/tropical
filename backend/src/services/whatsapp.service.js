const twilio = require('twilio');

class WhatsAppService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    this.client = null;
    
    // Only initialize Twilio client if credentials are properly configured
    if (this.accountSid && this.authToken && 
        this.accountSid.startsWith('AC') && 
        this.accountSid.length > 10) {
      try {
        this.client = twilio(this.accountSid, this.authToken);
        console.log('✓ Twilio WhatsApp service initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize Twilio client:', error.message);
        this.client = null;
      }
    } else {
      console.warn('⚠ Twilio credentials not properly configured. WhatsApp notifications will be disabled.');
      console.warn('  Please check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file');
    }
  }

  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If number doesn't start with country code, assume it's a US number
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    return `+${cleaned}`;
  }

  async sendOrderConfirmation(orderData) {
    if (!this.client) {
      console.log('WhatsApp service not configured. Skipping notification.');
      return { success: false, message: 'WhatsApp service not configured' };
    }

    try {
      const { customerInfo, orderNumber, items, pricing } = orderData;
      
      // Format the message
      let message = `🎉 *Order Confirmation*\n\n`;
      message += `Hello ${customerInfo.name}!\n\n`;
      message += `Your order has been placed successfully.\n\n`;
      message += `*Order Number:* ${orderNumber}\n\n`;
      message += `*Items:*\n`;
      
      items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}`;
        if (item.size) message += ` (${item.size})`;
        message += ` x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
      });
      
      message += `\n*Order Summary:*\n`;
      message += `Subtotal: $${pricing.subtotal.toFixed(2)}\n`;
      message += `Shipping: $${pricing.shipping.toFixed(2)}\n`;
      message += `*Total: $${pricing.total.toFixed(2)}*\n\n`;
      message += `Thank you for shopping with us! 🛍️`;

      const formattedPhone = this.formatPhoneNumber(customerInfo.phone);
      
      const response = await this.client.messages.create({
        from: `whatsapp:${this.whatsappNumber}`,
        to: `whatsapp:${formattedPhone}`,
        body: message
      });

      console.log(`WhatsApp notification sent successfully. SID: ${response.sid}`);
      
      return {
        success: true,
        messageSid: response.sid,
        message: 'WhatsApp notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send WhatsApp notification'
      };
    }
  }

  async sendOrderStatusUpdate(orderData, newStatus) {
    if (!this.client) {
      console.log('WhatsApp service not configured. Skipping notification.');
      return { success: false, message: 'WhatsApp service not configured' };
    }

    try {
      const { customerInfo, orderNumber } = orderData;
      
      const statusMessages = {
        confirmed: '✅ Your order has been confirmed!',
        processing: '📦 Your order is being processed.',
        shipped: '🚚 Your order has been shipped!',
        delivered: '🎉 Your order has been delivered!',
        cancelled: '❌ Your order has been cancelled.'
      };

      let message = `*Order Update*\n\n`;
      message += `Hello ${customerInfo.name}!\n\n`;
      message += `${statusMessages[newStatus] || 'Your order status has been updated.'}\n\n`;
      message += `*Order Number:* ${orderNumber}\n`;
      message += `*Status:* ${newStatus.toUpperCase()}\n\n`;
      message += `Thank you for shopping with us!`;

      const formattedPhone = this.formatPhoneNumber(customerInfo.phone);
      
      const response = await this.client.messages.create({
        from: `whatsapp:${this.whatsappNumber}`,
        to: `whatsapp:${formattedPhone}`,
        body: message
      });

      console.log(`WhatsApp status update sent successfully. SID: ${response.sid}`);
      
      return {
        success: true,
        messageSid: response.sid,
        message: 'WhatsApp status update sent successfully'
      };
    } catch (error) {
      console.error('Error sending WhatsApp status update:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send WhatsApp status update'
      };
    }
  }

  async sendAdminOrderNotification(orderData) {
    if (!this.client) {
      console.log('WhatsApp service not configured. Skipping admin notification.');
      return { success: false, message: 'WhatsApp service not configured' };
    }

    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
    if (!adminPhone) {
      console.log('Admin WhatsApp number not configured. Skipping admin notification.');
      return { success: false, message: 'Admin WhatsApp number not configured' };
    }

    try {
      const { customerInfo, orderNumber, items, pricing } = orderData;
      
      // Format the admin notification message
      let message = `🔔 *NEW ORDER RECEIVED*\n\n`;
      message += `*Order Number:* ${orderNumber}\n`;
      message += `*Order Time:* ${new Date().toLocaleString()}\n\n`;
      
      message += `*Customer Details:*\n`;
      message += `Name: ${customerInfo.name}\n`;
      message += `Email: ${customerInfo.email}\n`;
      message += `Phone: ${customerInfo.phone}\n`;
      
      if (customerInfo.address && customerInfo.address.street) {
        message += `\n*Shipping Address:*\n`;
        if (customerInfo.address.street) message += `${customerInfo.address.street}\n`;
        if (customerInfo.address.city) message += `${customerInfo.address.city}`;
        if (customerInfo.address.state) message += `, ${customerInfo.address.state}`;
        if (customerInfo.address.zipCode) message += ` ${customerInfo.address.zipCode}\n`;
        if (customerInfo.address.country) message += `${customerInfo.address.country}\n`;
      }
      
      message += `\n*Order Items:*\n`;
      items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}`;
        if (item.size) message += ` (${item.size})`;
        message += `\n   Qty: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}\n`;
      });
      
      message += `\n*Payment Summary:*\n`;
      message += `Subtotal: $${pricing.subtotal.toFixed(2)}\n`;
      message += `Shipping: $${pricing.shipping.toFixed(2)}\n`;
      message += `*Total: $${pricing.total.toFixed(2)}*\n\n`;
      message += `💰 *Payment Status:* PAID\n\n`;
      message += `⚡ Please process this order ASAP!`;

      const formattedAdminPhone = this.formatPhoneNumber(adminPhone);
      
      const response = await this.client.messages.create({
        from: `whatsapp:${this.whatsappNumber}`,
        to: `whatsapp:${formattedAdminPhone}`,
        body: message
      });

      console.log(`Admin WhatsApp notification sent successfully. SID: ${response.sid}`);
      
      return {
        success: true,
        messageSid: response.sid,
        message: 'Admin WhatsApp notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending admin WhatsApp notification:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send admin WhatsApp notification'
      };
    }
  }
}

module.exports = new WhatsAppService();
