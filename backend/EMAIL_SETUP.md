# Email Notification Setup Guide

## Overview
The application now uses email notifications instead of Twilio/WhatsApp for order confirmations. When a customer places an order:
- **Customer** receives a beautifully formatted order confirmation email
- **Admin** receives a detailed notification email with complete customer and order information

## Configuration Steps

### 1. Update Environment Variables

Edit your `.env` file with the following email configuration:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@tropical.com
FROM_NAME=Tropical Store

# Admin email to receive order notifications
ADMIN_EMAIL=admin@tropical.com
```

### 2. Gmail Setup (Recommended)

If using Gmail, you need to create an **App Password**:

1. Go to your Google Account settings
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Select **Mail** and your device
5. Copy the generated 16-character password
6. Use this password in `SMTP_PASSWORD` (not your regular Gmail password)

### 3. Other Email Providers

#### **Outlook/Hotmail**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_EMAIL=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### **Yahoo Mail**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_EMAIL=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

#### **Custom SMTP Server**
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587 or 465
SMTP_EMAIL=your-email@domain.com
SMTP_PASSWORD=your-password
```

### 4. Admin Email Configuration

Set the `ADMIN_EMAIL` to the email address where you want to receive order notifications:

```env
ADMIN_EMAIL=admin@yourdomain.com
```

If not set, it will default to the `SMTP_EMAIL` address.

## Email Features

### Customer Email Includes:
- ✅ Order confirmation message
- ✅ Order number and date
- ✅ Complete list of ordered items with quantities and prices
- ✅ Order summary (subtotal, shipping, total)
- ✅ Beautiful HTML formatting with gradient headers

### Admin Email Includes:
- ✅ Alert notification banner
- ✅ Order number, date, and payment status
- ✅ Complete customer details (name, email, phone)
- ✅ Shipping address (if provided)
- ✅ Detailed order items with pricing
- ✅ Payment summary
- ✅ Professional HTML formatting

## Testing

To test the email configuration:

1. Ensure all environment variables are properly set
2. Start the backend server: `npm run dev`
3. Create a test order through the application
4. Check both customer and admin email inboxes

## Troubleshooting

### Emails Not Sending

1. **Check console logs** - The server will log email sending status
2. **Verify credentials** - Ensure SMTP credentials are correct
3. **Check spam folder** - Emails might be filtered as spam initially
4. **Enable less secure apps** - Some providers require this setting
5. **Use App Passwords** - Gmail and Yahoo require app-specific passwords

### Common Errors

- **"Invalid login"** - Check SMTP_EMAIL and SMTP_PASSWORD
- **"Connection timeout"** - Verify SMTP_HOST and SMTP_PORT
- **"Self-signed certificate"** - Add `rejectUnauthorized: false` in transporter config (not recommended for production)

## Security Best Practices

1. ✅ Never commit `.env` file to version control
2. ✅ Use app-specific passwords instead of main account passwords
3. ✅ Regularly rotate email credentials
4. ✅ Use environment-specific email addresses for testing
5. ✅ Monitor email sending logs for suspicious activity

## Changes Made

### Removed:
- ❌ Twilio dependency and WhatsApp service
- ❌ `whatsapp.service.js` (replaced with `email.service.js`)
- ❌ Twilio environment variables

### Added:
- ✅ Nodemailer dependency
- ✅ `email.service.js` for email notifications
- ✅ Email configuration in `.env`
- ✅ Beautiful HTML email templates
- ✅ Admin email notifications with full order details

### Modified:
- 🔄 `order.controller.js` - Now uses email service
- 🔄 `order.routes.js` - Updated endpoint names
- 🔄 Order model - Changed notification tracking fields

## API Endpoints

- **POST** `/api/orders` - Create order (sends emails automatically)
- **POST** `/api/orders/:id/resend-notification` - Resend customer email

## Support

For issues or questions, check the console logs for detailed error messages. The email service will log:
- ✓ Successful email sends with message IDs
- ✗ Failed sends with error details
