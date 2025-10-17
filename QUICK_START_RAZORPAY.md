# ⚡ Quick Start - Razorpay Integration

## 🎯 5-Minute Setup

### Step 1: Get Razorpay Keys (2 minutes)

1. Go to https://razorpay.com and sign up
2. Login → **Settings** → **API Keys**
3. Click **Generate Test Key**
4. Copy **Key ID** (starts with `rzp_test_`)
5. Copy **Key Secret**

### Step 2: Update Environment Files (1 minute)

**Backend** - Edit `x:\desgin\tropical\backend\.env`:
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE
RAZORPAY_WEBHOOK_SECRET=optional_for_now
```

**Frontend** - Edit `x:\desgin\tropical\frontend\.env`:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
```

### Step 3: Start Servers (2 minutes)

**Terminal 1** (Backend):
```bash
cd x:\desgin\tropical\backend
npm run dev
```

**Terminal 2** (Frontend):
```bash
cd x:\desgin\tropical\frontend
npm run dev
```

### Step 4: Test Payment

1. Open http://localhost:5173 (or your frontend URL)
2. Add products to cart
3. Go to checkout
4. Fill in customer details
5. Click **"Pay with Razorpay"**
6. Use test card: `4111 1111 1111 1111`
7. Expiry: Any future date (e.g., 12/25)
8. CVV: Any 3 digits (e.g., 123)
9. Click Pay

✅ **Success!** You should see:
- Payment success message
- Order confirmation email
- Admin notification email
- Cart cleared

---

## 🧪 Test Cards

| Card Number | Result | Use Case |
|-------------|--------|----------|
| `4111 1111 1111 1111` | ✅ Success | Normal payment |
| `5104 0600 0000 0008` | ✅ 3D Secure | With OTP (use 1234) |
| `4000 0000 0000 0002` | ❌ Failed | Test failure handling |

---

## 🔍 Verify It's Working

### Backend Console Should Show:
```
✓ Razorpay initialized successfully
✓ Email service initialized successfully
Customer email notification: ✓ Sent
Admin email notification: ✓ Sent
```

### Frontend Should:
- ✅ Open Razorpay payment modal
- ✅ Show success toast after payment
- ✅ Clear cart
- ✅ Redirect to home

### Check Emails:
- ✅ Customer gets order confirmation
- ✅ Admin gets order details with customer info

---

## ⚠️ Troubleshooting

**"Payment service not configured"**
→ Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in backend `.env`

**Razorpay modal doesn't open**
→ Check `VITE_RAZORPAY_KEY_ID` in frontend `.env`

**No emails received**
→ Check SMTP settings in backend `.env` (see `QUICK_START.md`)

---

## 📚 More Info

- **Full Setup Guide**: See `RAZORPAY_SETUP_GUIDE.md`
- **Email Setup**: See `QUICK_START.md`
- **Razorpay Docs**: https://razorpay.com/docs

---

## 🚀 You're Ready!

Your payment integration is complete. Test with the cards above, then get Live API keys when ready for production.

**Need help?** Check `RAZORPAY_SETUP_GUIDE.md` for detailed documentation.
