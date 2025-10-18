# Razorpay Live Keys Setup Guide

## 🎯 Quick Guide to Add Live Keys

Your website is verified and ready for production. Here's how to add your Razorpay live keys:

---

## 📋 Prerequisites

Before switching to live mode, ensure:
- ✅ Website is fully tested with test keys
- ✅ Razorpay account KYC is complete
- ✅ Bank account is verified
- ✅ Business documents submitted
- ✅ All payment flows tested

---

## 🔑 Step 1: Get Live API Keys

### 1.1 Login to Razorpay Dashboard
- Go to: https://dashboard.razorpay.com
- Login with your credentials

### 1.2 Switch to Live Mode
- Look for the toggle at the top: **Test Mode** / **Live Mode**
- Click to switch to **Live Mode**
- You may need to complete KYC if not done

### 1.3 Generate Live Keys
1. Go to **Settings** (gear icon) → **API Keys**
2. You'll see your live keys or click **Generate Live Keys**
3. Copy both:
   - **Key ID** (starts with `rzp_live_`)
   - **Key Secret** (keep this secret!)

**Example:**
```
Key ID: rzp_live_AbCdEfGhIjKlMnOp
Key Secret: XyZ123456789AbCdEfGhIjKlMnOp
```

---

## 🔧 Step 2: Update Backend Environment

### 2.1 Open Backend .env File
Navigate to: `x:\desgin\tropical\backend\.env`

### 2.2 Update Razorpay Keys
Replace the test keys with your live keys:

```env
# Razorpay Payment Gateway Configuration - LIVE MODE
RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

**Example:**
```env
RAZORPAY_KEY_ID=rzp_live_AbCdEfGhIjKlMnOp
RAZORPAY_KEY_SECRET=XyZ123456789AbCdEfGhIjKlMnOp
RAZORPAY_WEBHOOK_SECRET=whsec_LiveWebhookSecret123
```

### 2.3 Save the File
- Save and close the `.env` file
- **IMPORTANT**: Never commit this file to Git!

---

## 🎨 Step 3: Update Frontend Environment

### 3.1 Open Frontend .env File
Navigate to: `x:\desgin\tropical\frontend\.env`

### 3.2 Update Razorpay Key ID
Replace with your live key ID:

```env
# Razorpay Configuration - LIVE MODE
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_KEY_ID
```

**Example:**
```env
VITE_RAZORPAY_KEY_ID=rzp_live_AbCdEfGhIjKlMnOp
```

### 3.3 Save the File
- Save and close the `.env` file
- **IMPORTANT**: Never commit this file to Git!

---

## 🔄 Step 4: Restart Your Application

### 4.1 Stop Running Servers
- Stop backend server (Ctrl+C in terminal)
- Stop frontend server (Ctrl+C in terminal)

### 4.2 Restart Backend
```bash
cd x:\desgin\tropical\backend
npm run dev
```

**Look for this message:**
```
✓ Razorpay initialized successfully
Server is running on port 5000
```

### 4.3 Restart Frontend
```bash
cd x:\desgin\tropical\frontend
npm run dev
```

---

## 🔔 Step 5: Setup Live Webhooks (Recommended)

Webhooks ensure you get notified of payment events even if the user closes the browser.

### 5.1 Get Your Production URL
You need your live website URL, for example:
- `https://www.thetropical.in`
- `https://yourdomain.com`

### 5.2 Configure Webhook in Razorpay
1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Click **+ Create New Webhook**
3. Enter details:
   - **Webhook URL**: `https://www.thetropical.in/api/payment/webhook`
   - **Alert Email**: Your email
   - **Active Events**: Select these:
     - ✅ `payment.authorized`
     - ✅ `payment.captured`
     - ✅ `payment.failed`
     - ✅ `order.paid`
4. Click **Create Webhook**
5. Copy the **Webhook Secret** shown

### 5.3 Update Backend .env
Add the webhook secret to your backend `.env`:

```env
RAZORPAY_WEBHOOK_SECRET=whsec_YourActualWebhookSecret
```

---

## ✅ Step 6: Verify Live Setup

### 6.1 Check Backend Console
After restart, you should see:
```
✓ Razorpay initialized successfully
Connected to MongoDB
Server is running on port 5000
```

### 6.2 Test a Small Transaction
1. Add a product to cart
2. Go to checkout
3. Fill in real details
4. Click "Pay with Razorpay"
5. **Use a real payment method** (small amount like ₹10)
6. Complete payment
7. Verify:
   - Order created in database
   - Email received
   - Payment shows in Razorpay Dashboard

---

## 🔐 Security Checklist

Before going live, ensure:

- [ ] `.env` files are NOT committed to Git
- [ ] `.gitignore` includes `.env`
- [ ] Live keys are different from test keys
- [ ] Key Secret is never exposed in frontend code
- [ ] HTTPS is enabled on production server
- [ ] Webhook secret is configured
- [ ] Email notifications are working
- [ ] Database backups are enabled

---

## 📊 Monitor Your Payments

### Razorpay Dashboard
- **Payments**: View all transactions
- **Settlements**: Check when money reaches your bank
- **Analytics**: View payment success rates
- **Disputes**: Handle chargebacks

### Your Admin Panel
- Go to: `http://localhost:5173` (or your admin URL)
- Login to admin panel
- Check **Orders** section
- Verify payment status and details

---

## 💰 Settlement Information

### Settlement Timeline
- **Domestic Cards**: T+3 days (3 business days)
- **UPI/Net Banking**: T+1 day (next business day)
- **International Cards**: T+5 days

### Settlement Account
- Ensure your bank account is verified in Razorpay
- Go to **Settings** → **Bank Accounts**
- Add and verify your business bank account

---

## 🚨 Important Notes

### 1. Test First
Always test with a small amount (₹10) before accepting real orders.

### 2. Keep Keys Secret
- Never share your Key Secret
- Never commit to Git
- Never expose in client-side code

### 3. Monitor Transactions
- Check Razorpay Dashboard daily
- Set up email alerts
- Review settlement reports

### 4. Handle Failures
- Test payment failures
- Ensure proper error messages
- Have a support process for failed payments

### 5. Compliance
- Display refund policy
- Show terms and conditions
- Comply with RBI guidelines

---

## 🔄 Switching Between Test and Live

### To Switch Back to Test Mode:
1. Replace `rzp_live_` keys with `rzp_test_` keys
2. Restart backend and frontend
3. Use test cards for testing

### To Switch to Live Mode:
1. Replace `rzp_test_` keys with `rzp_live_` keys
2. Restart backend and frontend
3. Accept real payments

---

## 🐛 Troubleshooting Live Mode

### Issue: "Payment service not configured"
**Solution**: 
- Check `.env` file has correct live keys
- Restart backend server
- Check backend console for initialization message

### Issue: Payment succeeds but order not created
**Solution**:
- Check backend logs for errors
- Verify database connection
- Check email service configuration

### Issue: Webhook not working
**Solution**:
- Verify webhook URL is correct
- Check webhook secret in `.env`
- Test webhook from Razorpay Dashboard
- Check server logs for webhook requests

### Issue: Settlement not received
**Solution**:
- Check settlement timeline (T+1 to T+5 days)
- Verify bank account in Razorpay
- Check for any KYC issues
- Contact Razorpay support

---

## 📞 Support Contacts

### Razorpay Support
- **Email**: support@razorpay.com
- **Phone**: 1800-102-0555 (India)
- **Dashboard**: https://dashboard.razorpay.com
- **Docs**: https://razorpay.com/docs

### For Technical Issues
- Check backend console logs
- Check browser console (F12)
- Review Razorpay Dashboard logs
- Check webhook delivery logs

---

## 📝 Quick Reference

### Backend .env Location
```
x:\desgin\tropical\backend\.env
```

### Frontend .env Location
```
x:\desgin\tropical\frontend\.env
```

### Required Environment Variables

**Backend:**
```env
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

**Frontend:**
```env
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
```

---

## ✅ Final Checklist

Before accepting real payments:

- [ ] Live keys added to backend `.env`
- [ ] Live key ID added to frontend `.env`
- [ ] Backend restarted successfully
- [ ] Frontend restarted successfully
- [ ] Test transaction completed successfully
- [ ] Order created in database
- [ ] Email notifications working
- [ ] Webhook configured (optional but recommended)
- [ ] Bank account verified in Razorpay
- [ ] KYC completed
- [ ] Terms and refund policy displayed
- [ ] HTTPS enabled on production

---

## 🎉 You're Live!

Once you've completed all steps and verified everything works:

1. ✅ Your website can accept real payments
2. ✅ Customers can pay with cards, UPI, net banking, wallets
3. ✅ Orders are automatically created
4. ✅ Emails are sent to customers and admin
5. ✅ Money settles to your bank account

**Congratulations on going live! 🚀**

---

## 📈 Next Steps

1. **Monitor First Few Transactions**
   - Watch for any issues
   - Verify settlements
   - Check customer feedback

2. **Optimize Checkout**
   - Track conversion rates
   - Reduce cart abandonment
   - Improve user experience

3. **Marketing**
   - Promote secure payment options
   - Highlight UPI (0% fees)
   - Build customer trust

4. **Scale**
   - Monitor transaction volumes
   - Plan for peak seasons
   - Consider payment analytics

---

**Need Help?** Refer to the main `RAZORPAY_SETUP_GUIDE.md` for detailed information.

**Good luck with your live payments! 💰🌴**
