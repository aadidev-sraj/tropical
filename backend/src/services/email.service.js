const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    
    // Initialize nodemailer transporter
    if (process.env.SMTP_HOST && process.env.SMTP_PORT && 
        process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT),
          secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
          }
        });
        console.log('✓ Email service initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize email service:', error.message);
        this.transporter = null;
      }
    } else {
      console.warn('⚠ Email credentials not properly configured. Email notifications will be disabled.');
      console.warn('  Please check SMTP_* variables in .env file');
    }
  }

  async sendOrderConfirmationEmail(orderData) {
    if (!this.transporter) {
      console.log('Email service not configured. Skipping notification.');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const { customerInfo, orderNumber, items, pricing } = orderData;
      
      // Format the email HTML
      let itemsHtml = '';
      items.forEach((item, index) => {
        itemsHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${index + 1}. ${item.name}${item.size ? ` (${item.size})` : ''}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation - The Tropical</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: #1a1a1a; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">The Tropical</h1>
            <p style="color: #40513E; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Order Confirmation</p>
          </div>
          
          <!-- Body -->
          <div style="background: #ffffff; padding: 40px 30px;">
            <p style="font-size: 18px; margin: 0 0 10px 0;">Hello <strong>${customerInfo.name}</strong>,</p>
            <p style="color: #666; margin: 0 0 30px 0;">Thank you for your order! We're excited to get your items to you.</p>
            
            <!-- Order Details -->
            <div style="background: #f9f9f9; padding: 20px; border-radius: 4px; margin: 0 0 25px 0; border-left: 4px solid #40513E;">
              <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">Order Details</h2>
              <p style="margin: 5px 0; color: #666;"><strong style="color: #1a1a1a;">Order Number:</strong> ${orderNumber}</p>
              <p style="margin: 5px 0; color: #666;"><strong style="color: #1a1a1a;">Order Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <!-- Items Ordered -->
            <div style="margin: 0 0 25px 0;">
              <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">Items Ordered</h2>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e5e5;">
                <thead>
                  <tr style="background: #1a1a1a;">
                    <th style="padding: 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 13px;">Item</th>
                    <th style="padding: 12px; text-align: center; color: #ffffff; font-weight: 600; font-size: 13px;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #ffffff; font-weight: 600; font-size: 13px;">Price</th>
                    <th style="padding: 12px; text-align: right; color: #ffffff; font-weight: 600; font-size: 13px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>
            
            <!-- Order Summary -->
            <div style="background: #f9f9f9; padding: 20px; border-radius: 4px; margin: 0 0 30px 0;">
              <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">Order Summary</h2>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: 500;">₹${pricing.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Shipping:</td>
                  <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: 500;">₹${pricing.shipping.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #1a1a1a;">
                  <td style="padding: 15px 0 0 0; font-weight: 700; font-size: 20px; color: #1a1a1a;">Total:</td>
                  <td style="padding: 15px 0 0 0; text-align: right; font-weight: 700; font-size: 20px; color: #40513E;">₹${pricing.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <!-- Footer Message -->
            <div style="text-align: center; padding: 30px 0 0 0; border-top: 1px solid #e5e5e5;">
              <p style="color: #1a1a1a; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">Thank you for shopping with The Tropical! 🌴</p>
              <p style="color: #999; font-size: 13px; margin: 0;">If you have any questions, feel free to contact us.</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #1a1a1a; padding: 20px 30px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} The Tropical. All rights reserved.</p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;"><a href="https://www.thetropical.in" style="color: #40513E; text-decoration: none;">www.thetropical.in</a></p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Tropical Store'}" <${process.env.SMTP_EMAIL}>`,
        to: customerInfo.email,
        subject: `Order Confirmation - ${orderNumber}`,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Customer email sent successfully. Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending email notification:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email notification'
      };
    }
  }

  async sendAdminOrderNotification(orderData) {
    if (!this.transporter) {
      console.log('Email service not configured. Skipping admin notification.');
      return { success: false, message: 'Email service not configured' };
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;
    if (!adminEmail) {
      console.log('Admin email not configured. Skipping admin notification.');
      return { success: false, message: 'Admin email not configured' };
    }

    try {
      const { customerInfo, orderNumber, items, pricing } = orderData;
      
      // Format the items list
      let itemsList = '';
      items.forEach((item, index) => {
        itemsList += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${index + 1}. ${item.name}${item.size ? ` (${item.size})` : ''}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      });

      // Format shipping address if available
      let addressHtml = '';
      if (customerInfo.address && customerInfo.address.street) {
        addressHtml = `
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Shipping Address</h3>
            <p style="margin: 5px 0;">${customerInfo.address.street}</p>
            <p style="margin: 5px 0;">${customerInfo.address.city}${customerInfo.address.state ? `, ${customerInfo.address.state}` : ''} ${customerInfo.address.zipCode || ''}</p>
            <p style="margin: 5px 0;">${customerInfo.address.country || ''}</p>
          </div>
        `;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Order Received</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🔔 NEW ORDER RECEIVED</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
              <p style="margin: 0; font-weight: bold;">⚡ Please process this order ASAP!</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #667eea; margin-top: 0;">Order Information</h2>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">PAID</span></p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #667eea; margin-top: 0;">Customer Details</h2>
              <p><strong>Name:</strong> ${customerInfo.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${customerInfo.email}">${customerInfo.email}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${customerInfo.phone}">${customerInfo.phone}</a></p>
            </div>
            
            ${addressHtml}
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #667eea; margin-top: 0;">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #667eea; color: white;">
                    <th style="padding: 10px; text-align: left;">Item</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #667eea; margin-top: 0;">Payment Summary</h2>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 5px;">Subtotal:</td>
                  <td style="padding: 5px; text-align: right;">₹${pricing.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 5px;">Shipping:</td>
                  <td style="padding: 5px; text-align: right;">₹${pricing.shipping.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #1a1a1a; font-weight: bold; font-size: 18px;">
                  <td style="padding: 10px 5px;">Total:</td>
                  <td style="padding: 10px 5px; text-align: right; color: #40513E;">₹${pricing.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: white; border-radius: 5px;">
              <p style="color: #666; margin: 0;">💰 Payment has been confirmed</p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">This is an automated notification</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Tropical Store'}" <${process.env.SMTP_EMAIL}>`,
        to: adminEmail,
        subject: `🔔 New Order #${orderNumber} - ${customerInfo.name}`,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Admin email sent successfully. Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Admin email notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending admin email notification:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send admin email notification'
      };
    }
  }
}

module.exports = new EmailService();
