# Email Connection Timeout Fix

## Your Error
```
ERROR Connection timeout
ERROR Send Error: Connection timeout
Error: Connection timeout
Code: ETIMEDOUT
Command: CONN
```

This means your server **cannot connect** to Gmail's SMTP server. This is usually a **network/firewall issue**, not a credentials issue.

## 🔧 Solutions (Try in Order)

### Solution 1: Switch to Port 465 (SSL) ⭐ RECOMMENDED

Port 587 might be blocked by your hosting provider or firewall. Port 465 uses SSL and is more reliable.

**Update your `.env` file:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Restart your server** and test again.

---

### Solution 2: Use SendGrid (Free Alternative) ⭐ BEST FOR PRODUCTION

SendGrid is more reliable than Gmail for production and works on all hosting providers.

#### Step 1: Sign up for SendGrid
1. Go to https://sendgrid.com/
2. Sign up (free tier: 100 emails/day)
3. Verify your email
4. Complete sender verification

#### Step 2: Get API Key
1. Go to Settings → API Keys
2. Create API Key
3. Copy the key (starts with `SG.`)

#### Step 3: Update `.env`
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_EMAIL=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key-here
ADMIN_EMAIL=your-verified-email@domain.com
FROM_NAME=The Tropical
```

**Important:** 
- `SMTP_EMAIL` must be exactly `apikey` (not your email)
- `SMTP_PASSWORD` is your SendGrid API key
- `ADMIN_EMAIL` should be your verified sender email

#### Step 4: Verify Sender
1. In SendGrid dashboard, go to Settings → Sender Authentication
2. Verify a single sender (your email)
3. Check your email and click verification link

#### Step 5: Restart and Test
```bash
npm start
```

---

### Solution 3: Use Mailgun (Another Alternative)

#### Step 1: Sign up
1. Go to https://www.mailgun.com/
2. Sign up (free tier: 5,000 emails/month for 3 months)

#### Step 2: Get SMTP Credentials
1. Go to Sending → Domain settings → SMTP credentials
2. Copy the credentials

#### Step 3: Update `.env`
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_EMAIL=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

---

### Solution 4: Gmail with OAuth2 (Complex but Reliable)

If you must use Gmail and ports are blocked, use OAuth2 instead of App Password.

This requires additional setup with Google Cloud Console. Let me know if you want detailed steps.

---

### Solution 5: Check if Ports are Blocked

Test if your server can reach Gmail's SMTP:

**On Windows (PowerShell):**
```powershell
Test-NetConnection -ComputerName smtp.gmail.com -Port 587
Test-NetConnection -ComputerName smtp.gmail.com -Port 465
```

**Expected output if port is OPEN:**
```
TcpTestSucceeded : True
```

**If port is BLOCKED:**
```
TcpTestSucceeded : False
WARNING: TCP connect to smtp.gmail.com:587 failed
```

If blocked, your hosting provider/firewall is blocking SMTP. Use SendGrid instead.

---

## 🎯 Quick Recommendation

### For Development (Local)
- **Use Gmail with Port 465** (Solution 1)
- Usually works on local machines

### For Production (Deployed)
- **Use SendGrid** (Solution 2) ⭐ RECOMMENDED
- More reliable, better deliverability
- Works on all hosting providers (Render, Vercel, Heroku, etc.)
- Free tier is generous (100 emails/day)

---

## 📋 Comparison

| Provider | Free Tier | Reliability | Setup Difficulty | Best For |
|----------|-----------|-------------|------------------|----------|
| **Gmail** | Unlimited | ⚠️ Medium | Easy | Development |
| **SendGrid** | 100/day | ✅ High | Easy | Production |
| **Mailgun** | 5000/3mo | ✅ High | Medium | Production |
| **AWS SES** | 62000/mo | ✅ High | Hard | Large Scale |

---

## 🔍 Debugging Steps

### 1. Check Current Settings
Look at server startup logs:
```
📧 Email service transporter created
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP Email: your-email@gmail.com
```

### 2. Test Connection
```bash
curl http://localhost:5000/api/email/test
```

### 3. Check Firewall
- Windows Firewall might block outbound SMTP
- Hosting provider might block ports 587/465
- Corporate networks often block SMTP

### 4. Test with SendGrid
If Gmail doesn't work, switch to SendGrid (it always works)

---

## ✅ After Switching to SendGrid

Your `.env` should look like:
```env
# SendGrid Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_EMAIL=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=your-verified-email@gmail.com
FROM_NAME=The Tropical

# Other settings
MONGODB_URI=your-mongodb-uri
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

**Restart server:**
```bash
npm start
```

**You should see:**
```
📧 Email service transporter created
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP Email: apikey
🔍 Verifying SMTP connection...
✅ Email service verified and ready to send emails!
```

**Test it:**
```bash
curl -X POST http://localhost:5000/api/email/test/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Testing SendGrid"}'
```

---

## 🚨 Common Mistakes

### Mistake 1: Wrong SendGrid Email
```env
❌ SMTP_EMAIL=your-email@gmail.com
✅ SMTP_EMAIL=apikey
```

### Mistake 2: Using Gmail Password Instead of App Password
```env
❌ SMTP_PASSWORD=your-gmail-password
✅ SMTP_PASSWORD=abcdefghijklmnop  # 16-char app password
```

### Mistake 3: Not Verifying Sender in SendGrid
- You MUST verify your sender email in SendGrid
- Check your email for verification link
- Without this, emails won't send

### Mistake 4: Firewall Blocking
- Check Windows Firewall
- Check antivirus software
- Check hosting provider restrictions

---

## 💡 Why This Happens

### Common Causes:
1. **Hosting Provider Blocks SMTP** (most common)
   - Render, Vercel, Railway often block port 587
   - Solution: Use SendGrid or port 465

2. **Firewall/Antivirus**
   - Windows Firewall blocks outbound SMTP
   - Corporate firewalls block email ports
   - Solution: Allow in firewall or use SendGrid

3. **Network Restrictions**
   - ISP blocks SMTP to prevent spam
   - VPN/Proxy interfering
   - Solution: Disable VPN or use SendGrid

4. **Gmail Rate Limiting**
   - Too many connection attempts
   - Solution: Wait 15 minutes, try again

---

## 🎉 Success Indicators

After fixing, you should see:

**Server Logs:**
```
✅ Email service verified and ready to send emails!
📤 Sending contact email from Test User (test@example.com) to admin...
✅ Contact email sent successfully!
   From: Test User (test@example.com)
   To: admin@yourdomain.com
   Message ID: <some-id>
   Response: 250 2.0.0 OK
```

**No More Errors:**
- ❌ No "Connection timeout"
- ❌ No "ETIMEDOUT"
- ❌ No "ECONNREFUSED"

---

## 📞 Still Not Working?

### Try This:
1. Switch to SendGrid (Solution 2) - Works 99% of the time
2. Check server logs for exact error
3. Test with `curl` command above
4. Verify SendGrid sender email
5. Check spam folder for test emails

### Need Help?
- SendGrid Docs: https://docs.sendgrid.com/
- SendGrid Support: https://support.sendgrid.com/
- Test email endpoint: `GET /api/email/test`

---

## 🚀 Recommended Setup

**For Production:**
```env
# Use SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_EMAIL=apikey
SMTP_PASSWORD=SG.your-api-key
ADMIN_EMAIL=admin@yourdomain.com
FROM_NAME=The Tropical
```

**Benefits:**
- ✅ Works on all hosting providers
- ✅ Better email deliverability
- ✅ No port blocking issues
- ✅ Professional email service
- ✅ Email analytics and tracking
- ✅ 100 free emails per day

**Switch now and your emails will work immediately!**
