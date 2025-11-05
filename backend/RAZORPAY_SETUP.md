# Razorpay Integration Guide

## Overview

Your application now has full Razorpay payment integration! This guide will help you set up and test the payment system.

## ✅ What's Already Implemented

### Backend
- ✅ Payment controller with Razorpay SDK
- ✅ Create order endpoint
- ✅ Payment verification endpoint
- ✅ Webhook handler for payment events
- ✅ Signature verification for security
- ✅ Order creation after successful payment
- ✅ Email notifications (customer + admin)

### Frontend
- ✅ Razorpay checkout integration
- ✅ Payment modal with prefilled customer info
- ✅ Payment verification flow
- ✅ Error handling and user feedback
- ✅ Cart integration
- ✅ Toast notifications for add to cart

## 🔧 Setup Instructions

### Step 1: Get Razorpay Credentials

1. **Sign up for Razorpay:**
   - Go to https://razorpay.com/
   - Sign up for a free account
   - Complete KYC (for live mode)

2. **Get API Keys:**
   - Go to Dashboard → Settings → API Keys
   - Generate Test/Live Keys
   - You'll get:
     - `Key ID` (starts with `rzp_test_` or `rzp_live_`)
     - `Key Secret`

3. **Get Webhook Secret (Optional but Recommended):**
   - Go to Dashboard → Settings → Webhooks
   - Create a new webhook
   - URL: `https://yourdomain.com/api/payment/webhook`
   - Events: Select `payment.captured`, `payment.failed`, `order.paid`
   - Copy the webhook secret

### Step 2: Configure Environment Variables

Add these to your `backend/.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here  # Optional

# Example for Test Mode:
# RAZORPAY_KEY_ID=rzp_test_1234567890abcd
# RAZORPAY_KEY_SECRET=abcdefghijklmnopqrstuvwx
```

### Step 3: Restart Your Backend

```bash
cd backend
npm start
```

You should see:
```
✓ Razorpay initialized successfully
```

### Step 4: Test the Integration

#### Test Mode (Recommended First)

1. **Use Test Credentials:**
   - Use `rzp_test_` keys from Razorpay dashboard
   - No real money will be charged

2. **Test Card Details:**
   ```
   Card Number: 4111 1111 1111 1111
   CVV: Any 3 digits
   Expiry: Any future date
   Name: Any name
   ```

3. **Test UPI:**
   ```
   UPI ID: success@razorpay
   ```

4. **Test Wallets:**
   - Select any wallet
   - Use test credentials provided by Razorpay

#### Live Mode (Production)

1. **Complete KYC:**
   - Submit business documents
   - Wait for approval (usually 24-48 hours)

2. **Switch to Live Keys:**
   ```env
   RAZORPAY_KEY_ID=rzp_live_your_live_key_id
   RAZORPAY_KEY_SECRET=your_live_key_secret
   ```

3. **Test with Small Amount:**
   - Make a real payment with ₹1
   - Verify order creation and emails

## 🔄 Payment Flow

### User Journey

1. **Add to Cart:**
   - User adds products to cart
   - Toast notification confirms addition
   - Cart icon updates with item count

2. **Proceed to Checkout:**
   - User clicks "Checkout" from cart
   - Redirected to `/payment` page

3. **Enter Details:**
   - User fills in contact information
   - Name, email, phone (required)
   - Shipping address (optional)

4. **Initiate Payment:**
   - User clicks "Pay with Razorpay"
   - Backend creates Razorpay order
   - Razorpay modal opens

5. **Complete Payment:**
   - User selects payment method (Card/UPI/Wallet/NetBanking)
   - Enters payment details
   - Completes payment

6. **Verification:**
   - Payment response sent to backend
   - Backend verifies signature
   - Order created in database
   - Email notifications sent

7. **Success:**
   - User sees success message
   - Cart is cleared
   - Redirected to home page

### Technical Flow

```
Frontend                Backend                 Razorpay
   |                       |                        |
   |-- Create Order ------>|                        |
   |                       |-- Create Order ------->|
   |                       |<-- Order ID -----------|
   |<-- Order Details -----|                        |
   |                       |                        |
   |-- Open Modal -------->|                        |
   |                       |                        |
   |-- User Pays --------->|                        |
   |<-- Payment Response --|                        |
   |                       |                        |
   |-- Verify Payment ---->|                        |
   |                       |-- Verify Signature --->|
   |                       |<-- Verified -----------|
   |                       |                        |
   |                       |-- Create Order in DB   |
   |                       |-- Send Emails          |
   |                       |                        |
   |<-- Success ---------- |                        |
```

## 🧪 Testing Checklist

### Basic Flow
- [ ] Add product to cart (toast notification appears)
- [ ] View cart (items displayed correctly)
- [ ] Proceed to checkout
- [ ] Fill customer information
- [ ] Click "Pay with Razorpay"
- [ ] Razorpay modal opens
- [ ] Complete test payment
- [ ] Order created successfully
- [ ] Confirmation email received (customer)
- [ ] Order notification received (admin)
- [ ] Cart cleared after payment

### Edge Cases
- [ ] Payment cancelled (modal dismissed)
- [ ] Payment failed (invalid card)
- [ ] Network error during payment
- [ ] Duplicate payment attempts
- [ ] Empty cart checkout prevention
- [ ] Invalid email/phone validation

### Security
- [ ] Payment signature verified
- [ ] Webhook signature verified (if configured)
- [ ] Authentication required for order creation
- [ ] Sensitive data not exposed in frontend

## 📊 Razorpay Dashboard

### Monitor Payments

1. **Payments Tab:**
   - View all transactions
   - Filter by status (captured/failed/refunded)
   - Export payment reports

2. **Orders Tab:**
   - View created orders
   - Check order status
   - Match with database orders

3. **Settlements Tab:**
   - View settlement schedule
   - Track payouts to bank account

### Handle Refunds

1. **Full Refund:**
   ```bash
   # Via Dashboard: Payments → Select payment → Refund
   ```

2. **Partial Refund:**
   - Available in dashboard
   - Specify amount to refund

## 🔐 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` file
- ✅ Use different keys for test/production
- ✅ Rotate keys periodically
- ✅ Restrict API key permissions

### Payment Verification
- ✅ Always verify signature on backend
- ✅ Never trust frontend payment data
- ✅ Use webhook for additional verification
- ✅ Log all payment attempts

### Data Protection
- ✅ Use HTTPS in production
- ✅ Don't store card details
- ✅ Comply with PCI-DSS (Razorpay handles this)
- ✅ Encrypt sensitive customer data

## 🐛 Troubleshooting

### Issue: "Payment service not configured"

**Cause:** Missing Razorpay credentials

**Solution:**
1. Check `.env` file has `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
2. Restart backend server
3. Check server logs for "✓ Razorpay initialized successfully"

### Issue: "Invalid payment signature"

**Cause:** Signature verification failed

**Solution:**
1. Ensure `RAZORPAY_KEY_SECRET` is correct
2. Check for extra spaces in environment variables
3. Verify payment response is not tampered

### Issue: Razorpay modal not opening

**Cause:** Razorpay script not loaded

**Solution:**
1. Check browser console for errors
2. Verify internet connection
3. Check if ad-blocker is blocking Razorpay
4. Clear browser cache

### Issue: Payment successful but order not created

**Cause:** Verification or database error

**Solution:**
1. Check backend logs for errors
2. Verify database connection
3. Check payment verification endpoint
4. Contact support with payment ID

### Issue: Webhook not receiving events

**Cause:** Webhook configuration issue

**Solution:**
1. Verify webhook URL is publicly accessible
2. Check webhook secret matches `.env`
3. Test webhook with Razorpay dashboard
4. Check server logs for webhook calls

## 💰 Pricing & Fees

### Razorpay Fees (India)

- **Domestic Cards:** 2% per transaction
- **International Cards:** 3% per transaction
- **UPI:** 0% (free until certain limit)
- **Wallets:** 2% per transaction
- **Net Banking:** 2% per transaction

### Settlement Time

- **Standard:** T+3 days (3 working days)
- **Instant:** Available for eligible merchants

## 📞 Support

### Razorpay Support
- Dashboard: https://dashboard.razorpay.com/
- Docs: https://razorpay.com/docs/
- Support: support@razorpay.com
- Phone: +91-80-6890-6200

### Test Resources
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
- Test UPI: https://razorpay.com/docs/payments/payments/test-upi/
- Webhooks: https://razorpay.com/docs/webhooks/

## 🚀 Going Live

### Pre-Launch Checklist

- [ ] KYC completed and approved
- [ ] Live API keys configured
- [ ] Webhook configured with live URL
- [ ] SSL certificate installed (HTTPS)
- [ ] Test payment with real money (₹1)
- [ ] Email notifications working
- [ ] Terms & conditions updated
- [ ] Privacy policy updated
- [ ] Refund policy defined
- [ ] Customer support ready

### Post-Launch

- [ ] Monitor first few transactions closely
- [ ] Set up payment alerts
- [ ] Configure auto-settlements
- [ ] Set up reconciliation process
- [ ] Train support team on refunds

## 📝 Additional Features (Optional)

### Subscriptions
- Razorpay supports recurring payments
- Useful for membership/subscription products

### Payment Links
- Generate payment links without checkout
- Share via email/SMS/WhatsApp

### Smart Collect
- Virtual accounts for each customer
- Automatic payment reconciliation

### Route
- Split payments to multiple accounts
- Useful for marketplace models

## 🎉 You're All Set!

Your Razorpay integration is complete! Test thoroughly in test mode before going live.

**Quick Start:**
1. Add Razorpay keys to `.env`
2. Restart backend
3. Test with test card: `4111 1111 1111 1111`
4. Verify order creation and emails
5. Go live when ready!
