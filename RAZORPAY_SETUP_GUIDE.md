# Razorpay Integration - Complete Setup Guide

## 🎉 Integration Complete!

Your Tropical e-commerce application now has a fully functional Razorpay payment gateway integrated. This guide will help you set it up and test it.

---

## 📋 What Was Implemented

### Backend
- ✅ `src/controllers/payment.controller.js` - Payment processing logic
- ✅ `src/routes/payment.routes.js` - Payment API endpoints
- ✅ `src/models/order.model.js` - Updated with payment details
- ✅ Payment verification using HMAC SHA256 signature
- ✅ Webhook handler for Razorpay events
- ✅ Email notifications after successful payment

### Frontend
- ✅ `src/hooks/useRazorpay.ts` - Razorpay SDK hook
- ✅ `src/pages/Payment.tsx` - Updated with Razorpay checkout
- ✅ Automatic Razorpay script loading
- ✅ Payment verification flow
- ✅ Error handling and user feedback

---

## 🚀 Setup Instructions

### Step 1: Get Razorpay API Keys

1. **Sign up** at https://razorpay.com
2. **Login** to Razorpay Dashboard
3. Go to **Settings** → **API Keys**
4. Click **Generate Test Key** (for testing)
5. Copy your **Key ID** and **Key Secret**

**Important**: Start with Test Mode keys. Switch to Live keys only when ready for production.

---

### Step 2: Configure Backend Environment

Edit `x:\desgin\tropical\backend\.env`:

```env
# Razorpay Payment Gateway Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Example**:
```env
RAZORPAY_KEY_ID=rzp_test_1234567890abcd
RAZORPAY_KEY_SECRET=abcdefghijklmnopqrstuvwxyz123456
RAZORPAY_WEBHOOK_SECRET=whsec_1234567890abcdef
```

---

### Step 3: Configure Frontend Environment

Edit `x:\desgin\tropical\frontend\.env`:

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
```

**Note**: Use the same Key ID as in backend `.env`

---

### Step 4: Start the Application

**Terminal 1 - Backend**:
```bash
cd x:\desgin\tropical\backend
npm install
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd x:\desgin\tropical\frontend
npm run dev
```

---

## 🧪 Testing the Integration

### Test Mode Cards

Razorpay provides test cards that work in Test Mode:

#### ✅ Successful Payment
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **Name**: Any name

#### ✅ 3D Secure Authentication
- **Card Number**: `5104 0600 0000 0008`
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: `1234` (in test mode)

#### ❌ Failed Payment
- **Card Number**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### UPI Testing (Test Mode)
- Use any UPI ID format: `test@paytm`, `success@razorpay`
- Test mode will simulate successful payment

### Net Banking
- Select any bank
- Use test credentials provided by Razorpay

---

## 📝 Testing Checklist

### 1. Basic Flow Test
- [ ] Add products to cart
- [ ] Go to checkout
- [ ] Fill customer information
- [ ] Click "Pay with Razorpay"
- [ ] Razorpay modal opens
- [ ] Enter test card details
- [ ] Payment succeeds
- [ ] Order created in database
- [ ] Email sent to customer
- [ ] Email sent to admin
- [ ] Cart cleared
- [ ] Redirected to home page

### 2. Payment Verification Test
- [ ] Check backend console for "Payment verified successfully"
- [ ] Check database for order with `paymentStatus: 'paid'`
- [ ] Verify `paymentDetails` contains Razorpay IDs

### 3. Email Notification Test
- [ ] Customer receives order confirmation email
- [ ] Admin receives order notification email
- [ ] Emails contain correct order details

### 4. Error Handling Test
- [ ] Try payment with failed card
- [ ] Close Razorpay modal (cancel payment)
- [ ] Check error messages display correctly
- [ ] Order not created if payment fails

---

## 🔄 Payment Flow Diagram

```
1. Customer fills checkout form
   ↓
2. Click "Pay with Razorpay"
   ↓
3. Backend creates Razorpay order
   ↓
4. Frontend opens Razorpay checkout modal
   ↓
5. Customer enters payment details
   ↓
6. Razorpay processes payment
   ↓
7. Payment success → Frontend receives response
   ↓
8. Frontend sends verification request to backend
   ↓
9. Backend verifies signature (HMAC SHA256)
   ↓
10. Backend creates order in database
    ↓
11. Backend sends email notifications
    ↓
12. Frontend clears cart and redirects
```

---

## 🔐 Security Features

### Payment Signature Verification
Every payment is verified using HMAC SHA256:
```javascript
const sign = razorpay_order_id + '|' + razorpay_payment_id;
const expectedSign = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(sign.toString())
  .digest('hex');
```

### Webhook Signature Verification
Webhooks are verified to ensure they're from Razorpay:
```javascript
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
  .update(body)
  .digest('hex');
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payment/create-order` | Create Razorpay order | Yes |
| POST | `/api/payment/verify` | Verify payment & create order | Yes |
| POST | `/api/payment/webhook` | Handle Razorpay webhooks | No (signature verified) |
| GET | `/api/payment/payment/:id` | Get payment details | Yes |

---

## 🎨 Currency Configuration

Currently set to **INR (Indian Rupees)**. To change:

**Backend** (`src/controllers/payment.controller.js`):
```javascript
currency: 'INR' // Change to USD, EUR, etc.
```

**Frontend** (`src/pages/Payment.tsx`):
```javascript
currency: "INR" // Match backend currency
```

**Price Formatting** (`src/pages/Payment.tsx`):
```javascript
function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { 
    style: "currency", 
    currency: "INR" 
  }).format(p);
}
```

---

## 🔔 Webhook Setup (Optional but Recommended)

Webhooks provide server-to-server notifications for payment events.

### 1. Setup Webhook URL

In Razorpay Dashboard:
1. Go to **Settings** → **Webhooks**
2. Click **Create Webhook**
3. Enter URL: `https://yourdomain.com/api/payment/webhook`
4. Select events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
5. Copy the **Webhook Secret**
6. Add to backend `.env` as `RAZORPAY_WEBHOOK_SECRET`

### 2. For Local Testing

Use **ngrok** to expose local server:
```bash
ngrok http 5000
```

Use the ngrok URL for webhook: `https://abc123.ngrok.io/api/payment/webhook`

---

## 🐛 Troubleshooting

### Issue: "Payment service not configured"
**Solution**: Check that `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in backend `.env`

### Issue: "Payment system is loading"
**Solution**: Wait for Razorpay script to load. Check browser console for errors.

### Issue: "Invalid payment signature"
**Solution**: 
- Verify `RAZORPAY_KEY_SECRET` matches your dashboard
- Check that payment IDs are being sent correctly

### Issue: Razorpay modal doesn't open
**Solution**:
- Check browser console for errors
- Verify `VITE_RAZORPAY_KEY_ID` is set in frontend `.env`
- Ensure Razorpay script loaded (check Network tab)

### Issue: Email not sent after payment
**Solution**:
- Check SMTP configuration in backend `.env`
- Verify email service is initialized (check backend console)
- Check spam folder

---

## 💰 Pricing

### Test Mode
- ✅ **Free** - No charges for test transactions

### Live Mode
- **Domestic Cards**: 2% per transaction
- **International Cards**: 3% + ₹2 per transaction
- **UPI**: 0% (free)
- **Net Banking**: ₹5 - ₹10 per transaction
- **Wallets**: 2% per transaction

**No setup fees, no monthly fees, no hidden charges**

---

## 📊 Order Tracking

Orders are stored with payment details:

```javascript
{
  orderNumber: "ORD-ABC123",
  paymentStatus: "paid",
  paymentDetails: {
    razorpayOrderId: "order_xyz",
    razorpayPaymentId: "pay_abc",
    razorpaySignature: "signature_hash"
  },
  customerInfo: { ... },
  items: [ ... ],
  pricing: { ... }
}
```

---

## 🚀 Going Live

### Before Production:

1. **Get Live API Keys**
   - Switch to Live mode in Razorpay Dashboard
   - Generate Live API keys
   - Update `.env` files with live keys

2. **Complete KYC**
   - Submit business documents
   - Bank account verification
   - Required for settlements

3. **Test Thoroughly**
   - Test all payment methods
   - Test failure scenarios
   - Verify email notifications

4. **Setup Webhooks**
   - Configure production webhook URL
   - Test webhook delivery

5. **Monitor Transactions**
   - Check Razorpay Dashboard regularly
   - Set up email alerts
   - Monitor settlement reports

---

## 📞 Support

### Razorpay Support
- **Dashboard**: https://dashboard.razorpay.com
- **Docs**: https://razorpay.com/docs
- **Support**: support@razorpay.com

### Test Your Integration
1. Use test cards provided above
2. Check backend console logs
3. Verify database entries
4. Confirm email delivery

---

## ✅ Success Indicators

Your integration is working if:
- ✅ Razorpay modal opens on "Pay with Razorpay" click
- ✅ Test payment succeeds with test card
- ✅ Backend logs show "Payment verified successfully"
- ✅ Order created in database with `paymentStatus: 'paid'`
- ✅ Customer receives order confirmation email
- ✅ Admin receives order notification email
- ✅ Cart is cleared after successful payment
- ✅ User redirected to home page

---

## 🎉 You're All Set!

Your Razorpay integration is complete and ready to test. Follow the setup instructions above, use the test cards, and verify everything works before going live.

**Happy Testing! 🚀**
