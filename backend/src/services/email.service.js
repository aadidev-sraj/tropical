const nodemailer = require('nodemailer');
const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.transporter = null;
    this.resend = null;
    this.isVerified = false;
    this.useResend = false;
    
    // Priority 1: Try Resend (HTTP API - works everywhere)
    if (process.env.RESEND_API_KEY) {
      try {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.useResend = true;
        this.isVerified = true; // Resend doesn't need verification
        console.log('📧 Email service initialized with Resend (HTTP API)');
        console.log('   From Email:', process.env.RESEND_FROM_EMAIL || process.env.SMTP_EMAIL || 'onboarding@resend.dev');
        console.log('   Admin Email:', process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL);
        console.log('   ✅ Resend is ready to send emails!');
      } catch (error) {
        console.error('❌ Failed to initialize Resend:', error.message);
        this.resend = null;
        this.useResend = false;
      }
    }
    
    // Priority 2: Fallback to SMTP (Nodemailer)
    if (!this.useResend && process.env.SMTP_HOST && process.env.SMTP_PORT && 
        process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      try {
        // Detect if using Brevo (formerly Sendinblue)
        const isBrevo = process.env.SMTP_HOST && process.env.SMTP_HOST.includes('brevo.com');
        
        const transportConfig = {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT),
          secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
          },
          // Timeout settings - more lenient for cloud providers
          connectionTimeout: 60000, // 60 seconds for initial connection
          greetingTimeout: 30000,
          socketTimeout: 60000,
          debug: process.env.NODE_ENV !== 'production', // Enable debug in development
          logger: process.env.NODE_ENV !== 'production' // Enable logger in development
        };

        // Brevo-specific optimizations
        if (isBrevo) {
          console.log('🔧 Detected Brevo SMTP - applying optimized settings...');
          // Brevo works better without connection pooling on serverless/cloud platforms
          transportConfig.pool = false;
          // Brevo requires STARTTLS on port 587
          if (process.env.SMTP_PORT === '587') {
            transportConfig.requireTLS = true;
            transportConfig.tls = {
              ciphers: 'SSLv3',
              rejectUnauthorized: false // Brevo has valid certs but some cloud platforms need this
            };
          }
        } else {
          // For other providers (Gmail, etc.), use pooling
          transportConfig.pool = true;
          transportConfig.maxConnections = 5;
          transportConfig.maxMessages = 10;
          transportConfig.tls = {
            rejectUnauthorized: true,
            minVersion: 'TLSv1.2'
          };
        }

        this.transporter = nodemailer.createTransport(transportConfig);
        
        console.log('📧 Email service transporter created');
        console.log('   SMTP Host:', process.env.SMTP_HOST);
        console.log('   SMTP Port:', process.env.SMTP_PORT);
        console.log('   SMTP Email:', process.env.SMTP_EMAIL);
        console.log('   Admin Email:', process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL);
        
        // Verify connection (non-blocking - don't wait for it)
        this.verifyConnection().catch(err => {
          console.warn('⚠ Email verification failed, but service will continue');
        });
      } catch (error) {
        console.error('❌ Failed to initialize email service:', error.message);
        console.error('   Full error:', error);
        this.transporter = null;
      }
    } else {
      console.warn('⚠ Email credentials not properly configured. Email notifications will be disabled.');
      console.warn('  Please check SMTP_* variables in .env file');
      console.warn('  Missing variables:');
      if (!process.env.SMTP_HOST) console.warn('    - SMTP_HOST');
      if (!process.env.SMTP_PORT) console.warn('    - SMTP_PORT');
      if (!process.env.SMTP_EMAIL) console.warn('    - SMTP_EMAIL');
      if (!process.env.SMTP_PASSWORD) console.warn('    - SMTP_PASSWORD');
    }
  }

  async verifyConnection() {
    if (!this.transporter) {
      console.warn('⚠ Cannot verify email connection - transporter not initialized');
      return false;
    }

    try {
      console.log('🔍 Verifying SMTP connection...');
      await this.transporter.verify();
      this.isVerified = true;
      console.log('✅ Email service verified and ready to send emails!');
      return true;
    } catch (error) {
      this.isVerified = false;
      console.error('❌ Email service verification FAILED!');
      console.error('   Error:', error.message);
      console.error('   Code:', error.code);
      console.error('   ');
      console.error('   Common solutions:');
      console.error('   1. For Gmail: Use App Password (not regular password)');
      console.error('      - Go to: https://myaccount.google.com/apppasswords');
      console.error('      - Enable 2-Step Verification first');
      console.error('      - Generate App Password and use it in SMTP_PASSWORD');
      console.error('   2. Check SMTP credentials are correct');
      console.error('   3. Check firewall/network allows SMTP connections');
      console.error('   4. For other providers, ensure "Less secure apps" is enabled');
      console.error('   ');
      return false;
    }
  }

  async sendWelcomeEmail(userData) {
    if (!this.transporter && !this.resend) {
      console.log('❌ Email service not configured. Skipping welcome email.');
      return { success: false, message: 'Email service not configured' };
    }

    if (!this.isVerified && !this.useResend) {
      console.warn('⚠ Email service not verified. Attempting to send anyway...');
    }

    try {
      const { name, email } = userData;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to The Tropical</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: #1a1a1a; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">The Tropical</h1>
            <p style="color: #40513E; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Welcome!</p>
          </div>
          
          <!-- Body -->
          <div style="background: #ffffff; padding: 40px 30px;">
            <p style="font-size: 18px; margin: 0 0 10px 0;">Hello <strong>${name}</strong>,</p>
            <p style="color: #666; margin: 0 0 30px 0;">Thank you for joining The Tropical! We're excited to have you as part of our community.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 4px; margin: 0 0 25px 0; border-left: 4px solid #40513E;">
              <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">What's Next?</h2>
              <ul style="margin: 0; padding-left: 20px; color: #666;">
                <li style="margin-bottom: 10px;">Browse our latest collection of premium apparel</li>
                <li style="margin-bottom: 10px;">Customize products with your own designs</li>
                <li style="margin-bottom: 10px;">Enjoy exclusive member benefits and updates</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://thetropical.in" style="display: inline-block; background: #40513E; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">Start Shopping</a>
            </div>

            <div style="text-align: center; padding: 30px 0 0 0; border-top: 1px solid #e5e5e5;">
              <p style="color: #1a1a1a; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">Welcome to The Tropical!</p>
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

      console.log(`📤 Sending welcome email to ${email}...`);
      
      // Use Resend if available (HTTP API - more reliable)
      if (this.useResend && this.resend) {
        const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_EMAIL || 'onboarding@resend.dev';
        const { data, error } = await this.resend.emails.send({
          from: `The Tropical <${fromEmail}>`,
          to: [email],
          subject: 'Welcome to The Tropical',
          html: htmlContent
        });

        if (error) {
          console.error('❌ Resend failed to send welcome email:', error.message || error);
          throw new Error(error.message || 'Resend welcome email failed');
        }

        console.log(`✅ Welcome email sent successfully via Resend!`);
        console.log(`   To: ${email}`);
        console.log(`   Message ID: ${data?.id}`);

        return {
          success: true,
          messageId: data?.id,
          message: 'Welcome email sent successfully via Resend'
        };
      }
      
      // Fallback to SMTP
      const mailOptions = {
        from: `"The Tropical" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: 'Welcome to The Tropical',
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent successfully via SMTP!`);
      console.log(`   To: ${email}`);
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Response: ${info.response}`);

      return {
        success: true,
        messageId: info.messageId,
        message: 'Welcome email sent successfully via SMTP'
      };
    } catch (error) {
      console.error('❌ Error sending welcome email:');
      console.error('   To:', email);
      console.error('   Error:', error.message);
      console.error('   Code:', error.code);
      console.error('   Command:', error.command);
      if (error.response) console.error('   Response:', error.response);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send welcome email'
      };
    }
  }

  async sendOrderConfirmationEmail(orderData) {
    if (!this.transporter && !this.resend) {
      console.log('Email service not configured. Skipping notification.');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const { customerInfo, orderNumber, items, pricing } = orderData;
      
      // Format the email HTML and collect customization images
      let itemsHtml = '';
      let customizationImagesHtml = '';
      const attachments = [];
      
      items.forEach((item, index) => {
        itemsHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${index + 1}. ${item.name}${item.size ? ` (${item.size})` : ''}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
        
        // Add customization images if present
        if (item.customization && (item.customization.frontImageUrl || item.customization.backImageUrl)) {
          customizationImagesHtml += `
            <div style="margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 4px; border-left: 4px solid #40513E;">
              <h3 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 16px; font-weight: 700;">Customized: ${item.name}</h3>
              <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          `;
          
          // Handle front customization (new customer upload format or old format)
          if (item.customization.frontDesign || item.customization.frontImageUrl) {
            let frontImageData = null;
            let frontImageInfo = '';
            
            if (item.customization.frontDesign) {
              // New format: customer uploaded design with positioning
              frontImageData = item.customization.frontDesign.imageUrl;
              frontImageInfo = `<p style="margin: 5px 0 10px 0; font-size: 12px; color: #888;">Position: X:${item.customization.frontDesign.x.toFixed(1)}% Y:${item.customization.frontDesign.y.toFixed(1)}% | Size: ${item.customization.frontDesign.width.toFixed(1)}x${item.customization.frontDesign.height.toFixed(1)}% | Rotation: ${item.customization.frontDesign.rotation}°</p>`;
            } else {
              // Old format: admin design
              frontImageData = item.customization.frontImageUrl.startsWith('http') 
                ? item.customization.frontImageUrl 
                : `${process.env.BACKEND_URL || 'http://localhost:5000'}${item.customization.frontImageUrl}`;
            }
            
            customizationImagesHtml += `
              <div style="flex: 1; min-width: 200px;">
                <p style="margin: 0 0 5px 0; font-weight: 600; color: #666; font-size: 14px;">Front View:</p>
                ${frontImageInfo}
                <img src="${frontImageData}" alt="Front customization" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" />
              </div>
            `;
            
            // Add as attachment (handle base64 data)
            if (frontImageData.startsWith('data:image')) {
              attachments.push({
                filename: `${item.name}-front-${index + 1}.png`,
                content: frontImageData.split('base64,')[1],
                encoding: 'base64',
                cid: `front-${index}@customization`
              });
            } else {
              attachments.push({
                filename: `${item.name}-front-${index + 1}.png`,
                path: frontImageData,
                cid: `front-${index}@customization`
              });
            }
          }
          
          // Handle back customization (new customer upload format or old format)
          if (item.customization.backDesign || item.customization.backImageUrl) {
            let backImageData = null;
            let backImageInfo = '';
            
            if (item.customization.backDesign) {
              // New format: customer uploaded design with positioning
              backImageData = item.customization.backDesign.imageUrl;
              backImageInfo = `<p style="margin: 5px 0 10px 0; font-size: 12px; color: #888;">Position: X:${item.customization.backDesign.x.toFixed(1)}% Y:${item.customization.backDesign.y.toFixed(1)}% | Size: ${item.customization.backDesign.width.toFixed(1)}x${item.customization.backDesign.height.toFixed(1)}% | Rotation: ${item.customization.backDesign.rotation}°</p>`;
            } else {
              // Old format: admin design
              backImageData = item.customization.backImageUrl.startsWith('http') 
                ? item.customization.backImageUrl 
                : `${process.env.BACKEND_URL || 'http://localhost:5000'}${item.customization.backImageUrl}`;
            }
            
            customizationImagesHtml += `
              <div style="flex: 1; min-width: 200px;">
                <p style="margin: 0 0 5px 0; font-weight: 600; color: #666; font-size: 14px;">Back View:</p>
                ${backImageInfo}
                <img src="${backImageData}" alt="Back customization" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" />
              </div>
            `;
            
            // Add as attachment (handle base64 data)
            if (backImageData.startsWith('data:image')) {
              attachments.push({
                filename: `${item.name}-back-${index + 1}.png`,
                content: backImageData.split('base64,')[1],
                encoding: 'base64',
                cid: `back-${index}@customization`
              });
            } else {
              attachments.push({
                filename: `${item.name}-back-${index + 1}.png`,
                path: backImageData,
                cid: `back-${index}@customization`
              });
            }
          }
          
          customizationImagesHtml += `
              </div>
            </div>
          `;
        }
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
            
            <!-- Customization Images -->
            ${customizationImagesHtml}
            
            <!-- Footer Message -->
            <div style="text-align: center; padding: 30px 0 0 0; border-top: 1px solid #e5e5e5;">
              <p style="color: #1a1a1a; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">Thank you for shopping with The Tropical!</p>
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

      console.log(`📤 Sending order confirmation email to ${customerInfo.email}...`);
      
      // Use Resend if available (HTTP API - more reliable)
      if (this.useResend && this.resend) {
        const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_EMAIL || 'onboarding@resend.dev';
        const { data, error } = await this.resend.emails.send({
          from: `The Tropical <${fromEmail}>`,
          to: [customerInfo.email],
          subject: `Order Confirmation - ${orderNumber}`,
          html: htmlContent
        });

        if (error) {
          console.error('❌ Resend failed to send order confirmation:', error.message || error);
          throw new Error(error.message || 'Resend order confirmation failed');
        }

        console.log(`✅ Order confirmation sent successfully via Resend!`);
        console.log(`   To: ${customerInfo.email}`);
        console.log(`   Order: ${orderNumber}`);
        console.log(`   Message ID: ${data?.id}`);

        return {
          success: true,
          messageId: data?.id,
          message: 'Order confirmation sent successfully via Resend'
        };
      }
      
      // Fallback to SMTP
      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Tropical Store'}" <${process.env.SMTP_EMAIL}>`,
        to: customerInfo.email,
        subject: `Order Confirmation - ${orderNumber}`,
        html: htmlContent,
        attachments: attachments.length > 0 ? attachments : undefined
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Order confirmation sent successfully via SMTP!`);
      console.log(`   To: ${customerInfo.email}`);
      console.log(`   Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Order confirmation sent successfully via SMTP'
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
    if (!this.transporter && !this.resend) {
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
      
      // Format the items list and collect customization images
      let itemsList = '';
      let customizationImagesHtml = '';
      const attachments = [];
      
      items.forEach((item, index) => {
        itemsList += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${index + 1}. ${item.name}${item.size ? ` (${item.size})` : ''}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
        
        // Add customization images if present (both old format and new customer upload format)
        const hasFrontCustomization = item.customization && (item.customization.frontImageUrl || item.customization.frontDesign);
        const hasBackCustomization = item.customization && (item.customization.backImageUrl || item.customization.backDesign);
        
        if (hasFrontCustomization || hasBackCustomization) {
          customizationImagesHtml += `
            <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 5px; border: 2px solid #667eea;">
              <h3 style="color: #667eea; margin: 0 0 15px 0; font-size: 16px; font-weight: 700;">🎨 Customized: ${item.name}</h3>
              <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          `;
          
          // Handle front customization (new customer upload format or old format)
          if (item.customization.frontDesign || item.customization.frontImageUrl) {
            let frontImageData = null;
            let frontImageInfo = '';
            
            if (item.customization.frontDesign) {
              // New format: customer uploaded design with positioning
              frontImageData = item.customization.frontDesign.imageUrl;
              frontImageInfo = `<p style="margin: 5px 0 10px 0; font-size: 12px; color: #888;">Position: X:${item.customization.frontDesign.x.toFixed(1)}% Y:${item.customization.frontDesign.y.toFixed(1)}% | Size: ${item.customization.frontDesign.width.toFixed(1)}x${item.customization.frontDesign.height.toFixed(1)}% | Rotation: ${item.customization.frontDesign.rotation}°</p>`;
            } else {
              // Old format: admin design
              frontImageData = item.customization.frontImageUrl.startsWith('http') 
                ? item.customization.frontImageUrl 
                : `${process.env.BACKEND_URL || 'http://localhost:5000'}${item.customization.frontImageUrl}`;
            }
            
            customizationImagesHtml += `
              <div style="flex: 1; min-width: 200px;">
                <p style="margin: 0 0 5px 0; font-weight: 600; color: #666; font-size: 14px;">Front View:</p>
                ${frontImageInfo}
                <img src="${frontImageData}" alt="Front customization" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" />
              </div>
            `;
            
            // Add as attachment (handle base64 data)
            if (frontImageData.startsWith('data:image')) {
              attachments.push({
                filename: `${item.name}-front-${index + 1}.png`,
                content: frontImageData.split('base64,')[1],
                encoding: 'base64',
                cid: `admin-front-${index}@customization`
              });
            } else {
              attachments.push({
                filename: `${item.name}-front-${index + 1}.png`,
                path: frontImageData,
                cid: `admin-front-${index}@customization`
              });
            }
          }
          
          // Handle back customization (new customer upload format or old format)
          if (item.customization.backDesign || item.customization.backImageUrl) {
            let backImageData = null;
            let backImageInfo = '';
            
            if (item.customization.backDesign) {
              // New format: customer uploaded design with positioning
              backImageData = item.customization.backDesign.imageUrl;
              backImageInfo = `<p style="margin: 5px 0 10px 0; font-size: 12px; color: #888;">Position: X:${item.customization.backDesign.x.toFixed(1)}% Y:${item.customization.backDesign.y.toFixed(1)}% | Size: ${item.customization.backDesign.width.toFixed(1)}x${item.customization.backDesign.height.toFixed(1)}% | Rotation: ${item.customization.backDesign.rotation}°</p>`;
            } else {
              // Old format: admin design
              backImageData = item.customization.backImageUrl.startsWith('http') 
                ? item.customization.backImageUrl 
                : `${process.env.BACKEND_URL || 'http://localhost:5000'}${item.customization.backImageUrl}`;
            }
            
            customizationImagesHtml += `
              <div style="flex: 1; min-width: 200px;">
                <p style="margin: 0 0 5px 0; font-weight: 600; color: #666; font-size: 14px;">Back View:</p>
                ${backImageInfo}
                <img src="${backImageData}" alt="Back customization" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" />
              </div>
            `;
            
            // Add as attachment (handle base64 data)
            if (backImageData.startsWith('data:image')) {
              attachments.push({
                filename: `${item.name}-back-${index + 1}.png`,
                content: backImageData.split('base64,')[1],
                encoding: 'base64',
                cid: `admin-back-${index}@customization`
              });
            } else {
              attachments.push({
                filename: `${item.name}-back-${index + 1}.png`,
                path: backImageData,
                cid: `admin-back-${index}@customization`
              });
            }
          }
          
          customizationImagesHtml += `
              </div>
            </div>
          `;
        }
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
            
            <!-- Customization Images -->
            ${customizationImagesHtml}
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: white; border-radius: 5px;">
              <p style="color: #666; margin: 0;">💰 Payment has been confirmed</p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">This is an automated notification</p>
            </div>
          </div>
        </body>
        </html>
      `;

      console.log(`📤 Sending admin order notification to ${adminEmail}...`);
      
      // Use Resend if available (HTTP API - more reliable)
      if (this.useResend && this.resend) {
        const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_EMAIL || 'onboarding@resend.dev';
        const { data, error } = await this.resend.emails.send({
          from: `The Tropical <${fromEmail}>`,
          to: [adminEmail],
          subject: `New Order #${orderNumber} - ${customerInfo.name}`,
          html: htmlContent
        });

        if (error) {
          console.error('❌ Resend failed to send admin notification:', error.message || error);
          throw new Error(error.message || 'Resend admin notification failed');
        }

        console.log(`✅ Admin notification sent successfully via Resend!`);
        console.log(`   To: ${adminEmail}`);
        console.log(`   Order: ${orderNumber}`);
        console.log(`   Message ID: ${data?.id}`);

        return {
          success: true,
          messageId: data?.id,
          message: 'Admin notification sent successfully via Resend'
        };
      }
      
      // Fallback to SMTP
      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Tropical Store'}" <${process.env.SMTP_EMAIL}>`,
        to: adminEmail,
        subject: `New Order #${orderNumber} - ${customerInfo.name}`,
        html: htmlContent,
        attachments: attachments.length > 0 ? attachments : undefined
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Admin notification sent successfully via SMTP!`);
      console.log(`   To: ${adminEmail}`);
      console.log(`   Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Admin notification sent successfully via SMTP'
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

  async sendContactMessage({ name, email, message }) {
    if (!this.transporter && !this.resend) {
      console.log('❌ Email service not configured. Skipping contact email.');
      return { success: false, message: 'Email service not configured' };
    }

    if (!this.isVerified && !this.useResend) {
      console.warn('⚠ Email service not verified. Attempting to send anyway...');
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;
    if (!adminEmail) {
      console.log('Admin email not configured. Skipping contact email.');
      return { success: false, message: 'Admin email not configured' };
    }

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Message</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: #1a1a1a; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">The Tropical</h1>
            <p style="color: #40513E; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">New Contact Message</p>
          </div>
          
          <!-- Body -->
          <div style="background: #ffffff; padding: 40px 30px;">
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 0 0 25px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: 600; color: #856404;">Someone is trying to reach you!</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 4px; margin: 0 0 25px 0; border-left: 4px solid #40513E;">
              <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">Contact Information</h2>
              <p style="margin: 5px 0; color: #666;"><strong style="color: #1a1a1a;">Name:</strong> ${name}</p>
              <p style="margin: 5px 0; color: #666;"><strong style="color: #1a1a1a;">Email:</strong> <a href="mailto:${email}" style="color: #40513E; text-decoration: none;">${email}</a></p>
              <p style="margin: 5px 0; color: #666;"><strong style="color: #1a1a1a;">Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 4px; margin: 0 0 25px 0; border-left: 4px solid #40513E;">
              <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">Message</h2>
              <div style="white-space: pre-wrap; background: #ffffff; padding: 15px; border-radius: 4px; border: 1px solid #e5e5e5; color: #666;">
${message}
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${email}" style="display: inline-block; background: #40513E; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">Reply to ${name}</a>
            </div>

            <div style="text-align: center; padding: 30px 0 0 0; border-top: 1px solid #e5e5e5;">
              <p style="color: #999; font-size: 13px; margin: 0;">This is an automated notification from your website contact form.</p>
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

      console.log(`📤 Sending contact email from ${name} (${email}) to admin...`);
      
      // Use Resend if available (HTTP API - more reliable)
      if (this.useResend && this.resend) {
        const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_EMAIL || 'onboarding@resend.dev';
        const { data, error } = await this.resend.emails.send({
          from: `The Tropical <${fromEmail}>`,
          to: [adminEmail],
          subject: `New Contact Message from ${name}`,
          replyTo: email,
          html: htmlContent
        });

        if (error) {
          console.error('❌ Resend failed to send contact email:', error.message || error);
          throw new Error(error.message || 'Resend contact email failed');
        }

        console.log(`✅ Contact email sent successfully via Resend!`);
        console.log(`   From: ${name} (${email})`);
        console.log(`   To: ${adminEmail}`);
        console.log(`   Message ID: ${data?.id}`);
        return { success: true, messageId: data?.id };
      }
      
      // Fallback to SMTP
      const mailOptions = {
        from: `"The Tropical" <${process.env.SMTP_EMAIL}>`,
        to: adminEmail,
        subject: `New Contact Message from ${name}`,
        replyTo: email,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Contact email sent successfully via SMTP!`);
      console.log(`   From: ${name} (${email})`);
      console.log(`   To: ${adminEmail}`);
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Response: ${info.response}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending contact email:');
      console.error('   From:', name, '(' + email + ')');
      console.error('   To:', adminEmail);
      console.error('   Error:', error.message);
      console.error('   Code:', error.code);
      console.error('   Command:', error.command);
      if (error.response) console.error('   Response:', error.response);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
