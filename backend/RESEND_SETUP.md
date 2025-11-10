# 📧 Resend Email Setup for Tropical Backend

## Why Resend Instead of SMTP?

### The Problem with SMTP on Cloud Platforms
- ❌ **Render blocks SMTP ports** (including Brevo, Gmail, etc.)
- ❌ **Connection timeouts** are common
- ❌ **Unreliable** on serverless/cloud environments
- ❌ **Complex configuration** (TLS, ports, authentication)

### Why Resend is Better
- ✅ **HTTP API** - No SMTP ports needed
- ✅ **Works everywhere** - Render, Vercel, Railway, etc.
- ✅ **Free tier**: 3,000 emails/month, 100 emails/day
- ✅ **Simple setup**: Just one API key
- ✅ **Better deliverability** - Professional email infrastructure
- ✅ **No timeouts** - HTTP is more reliable than SMTP
- ✅ **Modern**: Built for modern web apps

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email address

### Step 2: Get Your API Key

1. After login, go to **API Keys** section
2. Click **Create API Key**
3. Give it a name (e.g., "Tropical Production")
4. Select **Full Access** or **Sending Access**
5. Copy the API key (starts with `re_...`)
   - ⚠️ **Save it now!** You won't see it again

### Step 3: Add Domain (Optional but Recommended)

**For Production (Custom Domain):**
1. Go to **Domains** section
2. Click **Add Domain**
3. Enter your domain: `thetropical.in`
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually 5-10 minutes)

**For Testing (Use Resend's Domain):**
- You can use `onboarding@resend.dev` for testing
- No domain setup needed!

### Step 4: Update Environment Variables

#### On Render:

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add these variables:

```env
# Resend Configuration (Primary - HTTP API)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@thetropical.in

# Admin email (where contact forms go)
ADMIN_EMAIL=thetropicalfit@gmail.com

# SMTP (Fallback - Optional, can be removed)
# SMTP_HOST=smtp-relay.brevo.com
# SMTP_PORT=587
# SMTP_EMAIL=thetropicalfit@gmail.com
# SMTP_PASSWORD=your-brevo-key
```

5. Click **Save Changes**
6. Render will automatically redeploy

#### Local Development (.env file):

```env
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@thetropical.in

# Admin email
ADMIN_EMAIL=thetropicalfit@gmail.com
```

---

## 📋 Environment Variables Explained

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | ✅ Yes | Your Resend API key | `re_123abc...` |
| `RESEND_FROM_EMAIL` | ⚠️ Recommended | Sender email address | `noreply@thetropical.in` |
| `ADMIN_EMAIL` | ✅ Yes | Where contact forms are sent | `admin@thetropical.in` |
| `SMTP_*` | ❌ Optional | Fallback SMTP (not needed) | - |

---

## 🎯 Email Addresses Setup

### Option 1: Use Your Domain (Recommended for Production)

**From Email:**
```
RESEND_FROM_EMAIL=noreply@thetropical.in
```

**Requirements:**
- Domain must be verified in Resend
- Add DNS records to your domain

**Benefits:**
- ✅ Professional appearance
- ✅ Better deliverability
- ✅ Custom branding

### Option 2: Use Resend's Test Domain (For Testing)

**From Email:**
```
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Requirements:**
- None! Works immediately

**Limitations:**
- ⚠️ Less professional
- ⚠️ May go to spam
- ⚠️ Only for testing

---

## 🧪 Testing Your Setup

### Method 1: Use the Test Endpoint

After deploying, test your email service:

```bash
# Check if email service is configured
curl https://tropical-backend.onrender.com/api/email/test

# Send a test welcome email
curl -X POST https://tropical-backend.onrender.com/api/email/test/welcome \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com","name":"Test User"}'

# Send a test contact email
curl -X POST https://tropical-backend.onrender.com/api/email/test/contact \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","name":"John Doe","message":"Test message"}'
```

### Method 2: Sign Up on Your Website

1. Go to your website
2. Create a new account
3. Check your email for welcome message
4. Check spam folder if not in inbox

### Method 3: Use Contact Form

1. Go to your contact page
2. Fill out the form
3. Submit
4. Check admin email for the message

---

## 📊 How It Works

### Email Service Priority

The email service now uses this priority:

1. **Resend (HTTP API)** - If `RESEND_API_KEY` is set
   - ✅ Most reliable
   - ✅ Works on all platforms
   - ✅ No SMTP issues

2. **SMTP (Nodemailer)** - If Resend not available
   - ⚠️ Fallback only
   - ⚠️ May timeout on cloud platforms
   - ⚠️ Not recommended for production

### What Emails Are Sent?

1. **Welcome Email** - When user signs up
   - To: New user's email
   - Beautiful HTML template
   - Branding and call-to-action

2. **Order Confirmation** - When order is placed
   - To: Customer's email
   - Order details, items, pricing
   - Customization images attached

3. **Admin Order Notification** - When order is placed
   - To: Admin email
   - Full order details
   - Customer information

4. **Contact Form** - When someone contacts you
   - To: Admin email
   - Customer's message
   - Reply-to customer's email

---

## 🔍 Troubleshooting

### Issue: "Email service not configured"

**Cause:** `RESEND_API_KEY` not set

**Solution:**
1. Check Render environment variables
2. Make sure `RESEND_API_KEY` is set
3. Redeploy if needed

### Issue: "Invalid API key"

**Cause:** Wrong or expired API key

**Solution:**
1. Go to Resend dashboard
2. Generate a new API key
3. Update `RESEND_API_KEY` in Render
4. Redeploy

### Issue: "Domain not verified"

**Cause:** Using custom domain that's not verified

**Solution:**
1. Either verify your domain in Resend
2. Or use `onboarding@resend.dev` for testing

### Issue: Emails going to spam

**Cause:** Using test domain or domain not verified

**Solution:**
1. Verify your domain in Resend
2. Add SPF, DKIM records
3. Use professional from address
4. Avoid spam trigger words

### Issue: "Rate limit exceeded"

**Cause:** Sent too many emails

**Solution:**
- Free tier: 100 emails/day, 3,000/month
- Upgrade to paid plan if needed
- Check for email loops

---

## 💰 Resend Pricing

### Free Tier (Perfect for Starting)
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ 1 domain
- ✅ Full API access

### Paid Plans (If You Grow)
- **Pro**: $20/month - 50,000 emails
- **Business**: Custom pricing

**For most small businesses, the free tier is enough!**

---

## 🎉 Benefits Over SMTP

| Feature | Resend | SMTP (Brevo/Gmail) |
|---------|--------|-------------------|
| Works on Render | ✅ Yes | ❌ No (blocked) |
| Setup Time | 5 minutes | 30+ minutes |
| Reliability | ✅ High | ⚠️ Low on cloud |
| Timeouts | ✅ None | ❌ Common |
| Configuration | 1 API key | 4+ variables |
| Debugging | ✅ Easy | ❌ Complex |
| Deliverability | ✅ Excellent | ⚠️ Variable |
| Modern | ✅ HTTP API | ❌ Old protocol |

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)
- [Email Best Practices](https://resend.com/docs/knowledge-base/best-practices)

---

## 🔐 Security Best Practices

1. **Never commit API keys** to Git
2. **Use environment variables** only
3. **Rotate keys** if exposed
4. **Use different keys** for dev/prod
5. **Monitor usage** in Resend dashboard

---

## 🎯 Quick Checklist

- [ ] Sign up for Resend
- [ ] Get API key
- [ ] Add `RESEND_API_KEY` to Render
- [ ] Add `RESEND_FROM_EMAIL` to Render
- [ ] Add `ADMIN_EMAIL` to Render
- [ ] Deploy to Render
- [ ] Test with `/api/email/test`
- [ ] Test signup email
- [ ] Test contact form
- [ ] Verify domain (optional)
- [ ] Remove SMTP variables (optional)

---

## 💡 Pro Tips

1. **Use descriptive sender names**: `"The Tropical" <noreply@thetropical.in>`
2. **Set up domain early**: Better deliverability
3. **Monitor Resend dashboard**: Track email delivery
4. **Test in spam folder**: Make sure emails aren't marked as spam
5. **Use reply-to**: Set reply-to for contact forms
6. **Keep templates simple**: Less likely to trigger spam filters

---

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. Check Render logs for error messages
2. Test the `/api/email/test` endpoint
3. Verify API key is correct
4. Check Resend dashboard for delivery status
5. Make sure from email is verified

**The email service will now work reliably on Render! 🎉**
