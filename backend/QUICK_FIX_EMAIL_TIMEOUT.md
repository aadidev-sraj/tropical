# Quick Fix: Email Connection Timeout

## ⚡ 2-Minute Fix with SendGrid

Your Gmail SMTP is being blocked. Switch to SendGrid (it always works).

### Step 1: Get SendGrid API Key (2 minutes)

1. Go to https://sendgrid.com/ → Sign up (free)
2. Verify your email
3. Go to Settings → API Keys → Create API Key
4. Copy the key (starts with `SG.`)

### Step 2: Verify Your Sender Email (1 minute)

1. In SendGrid: Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Enter your email (the one you want to send FROM)
4. Check your email and click verification link

### Step 3: Update `.env` File

Replace your Gmail settings with:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_EMAIL=apikey
SMTP_PASSWORD=SG.paste-your-sendgrid-api-key-here
ADMIN_EMAIL=your-verified-email@gmail.com
FROM_NAME=The Tropical
```

**IMPORTANT:**
- `SMTP_EMAIL` must be exactly `apikey` (not your email!)
- `SMTP_PASSWORD` is your SendGrid API key
- `ADMIN_EMAIL` is the email you verified in Step 2

### Step 4: Restart Server

```bash
npm start
```

### Step 5: Test

```bash
curl http://localhost:5000/api/email/test
```

Should return:
```json
{
  "success": true,
  "message": "Email service is configured and verified"
}
```

## ✅ Done!

Your emails will now work. SendGrid is more reliable than Gmail for production anyway.

---

## Alternative: Try Gmail Port 465

If you really want to use Gmail, try port 465:

**Update `.env`:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

**Restart and test.**

If still timeout → Use SendGrid (recommended).

---

## Why SendGrid?

- ✅ Works on ALL hosting providers (Render, Vercel, etc.)
- ✅ No port blocking issues
- ✅ Better email deliverability (less spam)
- ✅ 100 free emails per day
- ✅ Email analytics
- ✅ Professional service

Gmail is fine for development, but SendGrid is better for production.

---

## 🎯 Your Current Error

```
ERROR Connection timeout
Code: ETIMEDOUT
Command: CONN
```

This means your server **cannot connect** to Gmail's SMTP server at all. It's a network/firewall issue, not a credentials issue.

**Solution:** Use SendGrid (network issues don't affect it).

---

## Test After Fix

Send a test contact email:

```bash
curl -X POST http://localhost:5000/api/email/test/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Testing email"}'
```

Check your admin email (and spam folder) for the message!
