# WhatsApp Order Notification Setup Guide

This guide will help you set up WhatsApp notifications for order confirmations using Twilio.

## Features Implemented

- ✅ WhatsApp order confirmation messages sent automatically to customers
- ✅ **WhatsApp order notifications sent to admin with full order details**
- ✅ Order status update notifications via WhatsApp
- ✅ Customer information collection (name, email, phone, address)
- ✅ Order tracking with unique order numbers
- ✅ Admin endpoints to manage orders and resend notifications

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com)
2. WhatsApp Business API access through Twilio

## Setup Instructions

### Step 1: Create a Twilio Account

1. Go to https://www.twilio.com and sign up for a free account
2. Verify your email and phone number

### Step 2: Set Up WhatsApp Sandbox (for Testing)

1. Log in to your Twilio Console
2. Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Follow the instructions to join the WhatsApp Sandbox:
   - Send a WhatsApp message to the provided number (usually `+1 415 523 8886`)
   - Send the code shown (e.g., "join <your-code>")
4. You're now connected to the Twilio WhatsApp Sandbox!

### Step 3: Get Your Twilio Credentials

1. In the Twilio Console, go to your **Dashboard**
2. Find your **Account SID** and **Auth Token**
3. Copy these values

### Step 4: Configure Backend Environment Variables

1. Open `backend/.env` file
2. Update the following variables with your Twilio credentials:

```env
TWILIO_ACCOUNT_SID=your_actual_account_sid
TWILIO_AUTH_TOKEN=your_actual_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
ADMIN_WHATSAPP_NUMBER=+1234567890
```

**Note:** 
- The WhatsApp number for the sandbox is typically `+14155238886`. For production, you'll use your approved WhatsApp Business number.
- Replace `+1234567890` with your actual admin WhatsApp number (with country code)

### Step 5: Restart the Backend Server

```bash
cd backend
npm run dev
```

## Testing the Feature

### 1. Place a Test Order

1. Start the frontend application
2. Add items to your cart
3. Go to checkout (`/payment`)
4. Fill in the customer information form:
   - **Name:** Your name
   - **Email:** Your email
   - **Phone:** Your WhatsApp number (with country code, e.g., `+1234567890`)
   - **Address:** Optional shipping address
5. Click "Place Order"

### 2. Check WhatsApp

**Customer receives:**
- Order confirmation
- Order number
- List of items ordered
- Pricing breakdown
- Total amount

**Admin receives:**
- New order alert
- Complete customer details (name, email, phone, address)
- Full order details with item breakdown
- Payment summary
- Order timestamp

### Sample WhatsApp Messages

**Customer Message:**
```
🎉 *Order Confirmation*

Hello John Doe!

Your order has been placed successfully.

*Order Number:* ORD-ABC123-XYZ

*Items:*
1. Elegant Black Dress (M) x1 - $89.00
2. Classic White Blazer x1 - $129.00

*Order Summary:*
Subtotal: $218.00
Shipping: $10.00
*Total: $228.00*

Thank you for shopping with us! 🛍️
```

**Admin Message:**
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

## API Endpoints

### User Endpoints (Require Authentication)

- **POST** `/api/orders` - Create a new order with WhatsApp notification
- **GET** `/api/orders/my-orders` - Get all orders for logged-in user
- **GET** `/api/orders/:id` - Get a specific order
- **POST** `/api/orders/:id/resend-notification` - Resend WhatsApp notification

### Admin Endpoints (Require Admin Role)

- **GET** `/api/orders` - Get all orders
- **PATCH** `/api/orders/:id/status` - Update order status (sends WhatsApp notification)

## Order Status Updates

Admins can update order status, which automatically sends WhatsApp notifications:

- `pending` → Order received
- `confirmed` → ✅ Order confirmed
- `processing` → 📦 Order being processed
- `shipped` → 🚚 Order shipped
- `delivered` → 🎉 Order delivered
- `cancelled` → ❌ Order cancelled

## Production Setup

For production use, you need to:

1. **Apply for WhatsApp Business API** through Twilio
2. **Get your business verified** by Meta/Facebook
3. **Set up message templates** (required for production)
4. **Update the WhatsApp number** in `.env` to your approved business number
5. **Configure webhook URLs** for delivery status updates

### Costs

- **Sandbox:** Free for testing
- **Production:** Pay-as-you-go pricing (check Twilio's pricing page)
  - Typically ~$0.005 per message (varies by country)

## Troubleshooting

### WhatsApp Message Not Received

1. **Check if you joined the sandbox:** Send "join <code>" to the Twilio WhatsApp number
2. **Verify phone number format:** Must include country code (e.g., `+1234567890`)
3. **Check Twilio credentials:** Ensure Account SID and Auth Token are correct
4. **Review backend logs:** Check for error messages in the console
5. **Verify Twilio account status:** Ensure your account is active and has credits

### Common Errors

**Error: "WhatsApp service not configured"**
- Solution: Add Twilio credentials to `.env` file

**Error: "Unable to create record"**
- Solution: Ensure the recipient has joined the WhatsApp sandbox

**Error: "Authentication failed"**
- Solution: Double-check your Account SID and Auth Token

## Database Schema

### Order Model

```javascript
{
  user: ObjectId,
  orderNumber: String (auto-generated),
  items: [{
    productId: Number,
    name: String,
    price: Number,
    quantity: Number,
    size: String,
    image: String
  }],
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  pricing: {
    subtotal: Number,
    shipping: Number,
    total: Number
  },
  status: String,
  paymentStatus: String,
  whatsappNotificationSent: Boolean,
  whatsappNotificationSentAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Notes

- Never commit `.env` file with real credentials to version control
- Use environment variables for sensitive data
- Implement rate limiting for order creation endpoints
- Validate phone numbers before sending messages
- Consider implementing message queue for high-volume scenarios

## Support

For issues with:
- **Twilio/WhatsApp:** Visit https://support.twilio.com
- **Application bugs:** Check the backend logs and frontend console

## Future Enhancements

- [ ] Add order tracking page for customers
- [ ] Implement email notifications alongside WhatsApp
- [ ] Add support for multiple languages
- [ ] Include order tracking links in WhatsApp messages
- [ ] Add rich media (images) to WhatsApp messages
- [ ] Implement two-way communication (customer replies)
