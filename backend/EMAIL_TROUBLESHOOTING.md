# Email Service Troubleshooting Guide

## Quick Diagnosis

### Step 1: Check Server Logs
When you start your backend server, look for these messages:

✅ **GOOD** - Email service is working:
```
📧 Email service transporter created
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP Email: your-email@gmail.com
   Admin Email: admin@yourdomain.com
🔍 Verifying SMTP connection...
✅ Email service verified and ready to send emails!
```

❌ **BAD** - Email service has issues:
```
❌ Email service verification FAILED!
   Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

### Step 2: Use Test Endpoints

The backend now has test endpoints to help you debug:

#### Check Email Configuration
```bash
GET http://localhost:5000/api/email/test
```

This will tell you:
- Is email service configured?
- Is SMTP connection verified?
- What are your current settings?

#### Test Welcome Email
```bash
POST http://localhost:5000/api/email/test/welcome
Content-Type: application/json

{
  "name": "Test User",
  "email": "your-test-email@gmail.com"
}
```

#### Test Contact Email
```bash
POST http://localhost:5000/api/email/test/contact
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "message": "This is a test message"
}
```

#### Force Re-verify Connection
```bash
POST http://localhost:5000/api/email/verify
```

## Common Issues & Solutions

### Issue 1: "Invalid login" or "Username and Password not accepted"

**Cause:** Using regular Gmail password instead of App Password

**Solution:**
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (required for App Passwords)
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and your device
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
6. Update your `.env` file:
   ```env
   SMTP_PASSWORD=abcdefghijklmnop  # Remove spaces!
   ```
7. Restart your server

### Issue 2: "Connection timeout" or "ETIMEDOUT"

**Cause:** Firewall or network blocking SMTP connections

**Solutions:**
- Check if your firewall allows outbound connections on port 587
- Try using port 465 with secure connection:
  ```env
  SMTP_PORT=465
  ```
- If on a restricted network, try using a different network
- Check if your hosting provider blocks SMTP

### Issue 3: Emails going to Spam

**Solutions:**
1. **Add SPF record** to your domain DNS:
   ```
   v=spf1 include:_spf.google.com ~all
   ```

2. **Use a verified domain email** instead of generic Gmail:
   ```env
   SMTP_EMAIL=noreply@yourdomain.com
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=Your Company Name
   ```

3. **Warm up your email** - Start with small volumes

### Issue 4: "Email service not configured"

**Cause:** Missing environment variables

**Solution:**
Check your `.env` file has ALL required variables:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourdomain.com
FROM_NAME=Your Store Name
```

### Issue 5: Emails sent but not received

**Possible causes:**
1. **Check spam folder** - Most common issue
2. **Wrong admin email** - Check `ADMIN_EMAIL` in `.env`
3. **Email provider blocking** - Check your email provider's logs
4. **Rate limiting** - Gmail has sending limits (500/day for free accounts)

**Debug steps:**
1. Check server logs for "✅ Email sent successfully" message
2. Look for the Message ID in logs
3. Use test endpoints to verify
4. Try sending to a different email address

### Issue 6: "Self-signed certificate" error

**Solution:**
Add to your email service configuration (NOT recommended for production):
```javascript
rejectUnauthorized: false
```

## Gmail-Specific Setup

### For Gmail (@gmail.com)

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
   - Use this in `SMTP_PASSWORD` (remove spaces)

3. **Your `.env` should look like:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=youremail@gmail.com
   SMTP_PASSWORD=abcdefghijklmnop
   ADMIN_EMAIL=youremail@gmail.com
   FROM_NAME=The Tropical
   ```

### For Google Workspace (Custom Domain)

Same as Gmail, but use your custom domain email:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=noreply@yourdomain.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourdomain.com
```

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_EMAIL=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_EMAIL=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```
Note: Yahoo also requires App Password

### SendGrid (Recommended for Production)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_EMAIL=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_EMAIL=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

## Testing Checklist

- [ ] All SMTP_* variables are set in `.env`
- [ ] Using App Password (not regular password) for Gmail
- [ ] Server shows "✅ Email service verified"
- [ ] Test endpoint returns success: `GET /api/email/test`
- [ ] Can send test welcome email: `POST /api/email/test/welcome`
- [ ] Can send test contact email: `POST /api/email/test/contact`
- [ ] Check spam folder for test emails
- [ ] Verify ADMIN_EMAIL is correct
- [ ] Server logs show detailed send information

## Production Recommendations

1. **Use a dedicated email service:**
   - SendGrid (99,000 free emails/month)
   - AWS SES (62,000 free emails/month)
   - Mailgun (5,000 free emails/month)

2. **Set up proper DNS records:**
   - SPF record
   - DKIM record
   - DMARC record

3. **Use a custom domain email:**
   - `noreply@yourdomain.com` instead of Gmail

4. **Monitor email deliverability:**
   - Track bounce rates
   - Monitor spam complaints
   - Use email validation

5. **Implement rate limiting:**
   - Prevent abuse
   - Stay within provider limits

## Still Having Issues?

1. **Check server logs** when sending emails - they now show detailed information
2. **Use the test endpoints** to isolate the problem
3. **Try a different email provider** to rule out provider-specific issues
4. **Check your email provider's logs** for rejected emails
5. **Verify network connectivity** to SMTP servers

## Support

If you're still stuck, provide these details:
- Server logs when starting the backend
- Response from `GET /api/email/test`
- Error messages from test endpoints
- Email provider you're using
- Any firewall or network restrictions
