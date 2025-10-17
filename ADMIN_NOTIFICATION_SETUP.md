# Admin WhatsApp Notification Setup

## Quick Setup Guide

When a customer places an order, the admin will automatically receive a detailed WhatsApp notification with all order information.

### Step 1: Configure Admin WhatsApp Number

1. Open `backend/.env`
2. Set your admin WhatsApp number:

```env
ADMIN_WHATSAPP_NUMBER=+1234567890
```

**Important:** 
- Include the country code (e.g., `+91` for India, `+1` for USA)
- Make sure this number has joined the Twilio WhatsApp Sandbox (send "join <code>" to the Twilio number)

### Step 2: Restart Backend Server

```bash
cd backend
npm start
```

### Step 3: Test It

1. Place a test order from the frontend
2. Check your admin WhatsApp - you should receive a message like:

```
🔔 *NEW ORDER RECEIVED*

*Order Number:* ORD-ABC123-XYZ
*Order Time:* 10/14/2025, 11:30:00 AM

*Customer Details:*
Name: John Doe
Email: john@example.com
Phone: +1234567890

*Shipping Address:*
123 Main Street
New York, NY 10001
USA

*Order Items:*
1. Elegant Black Dress (M)
   Qty: 1 × $89.00 = $89.00
2. Classic White Blazer
   Qty: 1 × $129.00 = $129.00

*Payment Summary:*
Subtotal: $218.00
Shipping: $10.00
*Total: $228.00*

💰 *Payment Status:* PAID

⚡ Please process this order ASAP!
```

## What Information Does Admin Receive?

✅ **Order Details:**
- Unique order number
- Order timestamp
- Payment status

✅ **Customer Information:**
- Full name
- Email address
- Phone number
- Complete shipping address (if provided)

✅ **Product Details:**
- Item names
- Sizes (if applicable)
- Quantities
- Individual prices
- Line totals

✅ **Financial Summary:**
- Subtotal
- Shipping cost
- Grand total

## Benefits for Business Operations

1. **Instant Alerts** - Know immediately when orders come in
2. **Complete Information** - All details needed to process the order
3. **Mobile Access** - Manage orders from anywhere via WhatsApp
4. **No App Required** - Works directly in WhatsApp
5. **Customer Contact** - Direct access to customer phone number for follow-up

## Troubleshooting

### Admin Not Receiving Notifications

1. **Check if admin number joined sandbox:**
   - Send "join <your-code>" to `+1 415 523 8886` from admin's WhatsApp

2. **Verify phone number format:**
   - Must include `+` and country code
   - Example: `+919876543210` (India) or `+12025551234` (USA)

3. **Check backend logs:**
   - Look for "Admin WhatsApp notification sent successfully"
   - Or error messages about admin notifications

4. **Verify .env configuration:**
   - Make sure `ADMIN_WHATSAPP_NUMBER` is set correctly
   - Restart server after changing .env

### Customer Gets Notification But Admin Doesn't

- This is usually a configuration issue with `ADMIN_WHATSAPP_NUMBER`
- Check the backend console for error messages
- Ensure the admin number has joined the Twilio sandbox

## Multiple Admins (Future Enhancement)

Currently supports one admin number. To add multiple admins:

1. Modify `whatsapp.service.js` to accept an array of admin numbers
2. Loop through and send to each admin
3. Update `.env` to support comma-separated numbers

Example future implementation:
```env
ADMIN_WHATSAPP_NUMBERS=+1234567890,+9876543210,+1122334455
```

## Production Considerations

For production use:
1. Apply for WhatsApp Business API approval
2. Set up proper message templates
3. Consider using a dedicated business WhatsApp number
4. Implement message queuing for high volume
5. Add delivery status tracking
6. Set up automated responses

## Cost Estimate

- **Sandbox (Testing):** Free
- **Production:** ~$0.005 per message (varies by country)
- **Example:** 100 orders/day = ~$1/day for notifications

## Support

If you need help:
1. Check the main `WHATSAPP_SETUP.md` for detailed Twilio setup
2. Review backend logs for error messages
3. Verify all environment variables are set correctly
4. Ensure Twilio account has sufficient credits
