# Quick Start - Email Notifications Setup

## ⚡ Fast Setup (5 minutes)

### Step 1: Configure Email Settings

Edit `x:\desgin\tropical\backend\.env` and update these lines:

```env
# Replace with your actual Gmail account
SMTP_EMAIL=youremail@gmail.com
SMTP_PASSWORD=your-16-char-app-password

# Replace with admin email (where you want to receive order notifications)
ADMIN_EMAIL=admin@yourdomain.com
```

### Step 2: Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Search for "App passwords" or go to https://myaccount.google.com/apppasswords
4. Select **Mail** and your device
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
6. Paste it in `.env` as `SMTP_PASSWORD` (remove spaces)

### Step 3: Start the Server

```bash
cd x:\desgin\tropical\backend
npm install
npm run dev
```

### Step 4: Test It

1. Create a test order through your application
2. Check the console logs for:
   ```
   ✓ Email service initialized successfully
   Customer email notification: ✓ Sent
   Admin email notification: ✓ Sent
   ```
3. Check your email inboxes (customer and admin)

## 📧 What You'll Receive

### Customer Email
- Beautiful order confirmation
- Order number and details
- Itemized list with prices
- Order total

### Admin Email (YOU)
- 🔔 New order alert
- Complete customer information (name, email, phone, address)
- Full order details
- Payment status: PAID
- Professional formatting

## ⚠️ Troubleshooting

### "Email service not configured"
- Check that all SMTP_* variables are set in `.env`
- Restart the server after changing `.env`

### "Invalid login"
- Use App Password, not your regular Gmail password
- Enable 2-Step Verification first
- Remove any spaces from the app password

### "Connection refused"
- Check SMTP_HOST and SMTP_PORT are correct
- Ensure your firewall allows outbound SMTP connections

### Emails in Spam
- Mark the first email as "Not Spam"
- Future emails should arrive in inbox

## 🎯 What Changed

- ❌ **Removed**: Twilio/WhatsApp notifications
- ✅ **Added**: Email notifications with nodemailer
- ✅ **Admin gets**: Full order details via email
- ✅ **Customer gets**: Order confirmation via email

## 📚 More Information

- **Detailed Setup**: See `EMAIL_SETUP.md`
- **Migration Details**: See `MIGRATION_SUMMARY.md`
- **Environment Template**: See `.env.example`

## 🚀 Ready to Go!

Once configured, every order will automatically:
1. Send confirmation email to customer
2. Send notification email to admin with full details
3. Log success/failure in console

No manual intervention needed! 🎉
