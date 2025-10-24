# Create Environment Files - IMPORTANT!

## You Need to Create These Files Manually

I cannot create `.env` files directly (they're gitignored for security), so you need to create them manually.

## Frontend Environment File

**Create this file**: `frontend/.env`

**Paste this exact content**:
```env
VITE_API_BASE=https://tropical-backend.onrender.com/api
```

### How to Create:
1. Open `frontend` folder
2. Create new file named `.env` (starts with a dot)
3. Paste the content above
4. Save the file

### Or use command line:
```bash
cd frontend
echo "VITE_API_BASE=https://tropical-backend.onrender.com/api" > .env
```

---

## CMS Environment File

**Create this file**: `tropical-cms/.env`

**Paste this exact content**:
```env
VITE_API_URL=https://tropical-backend.onrender.com
```

### How to Create:
1. Open `tropical-cms` folder
2. Create new file named `.env`
3. Paste the content above
4. Save the file

### Or use command line:
```bash
cd tropical-cms
echo "VITE_API_URL=https://tropical-backend.onrender.com" > .env
```

---

## After Creating the Files

### 1. Rebuild Frontend
```bash
cd frontend
npm run build
```

### 2. Rebuild CMS
```bash
cd tropical-cms
npm run build
```

### 3. Redeploy Both
Deploy the new `dist` folders to your hosting platform.

---

## Verify It Works

After redeploying:

1. Open your deployed frontend
2. Press F12 to open DevTools
3. Go to Network tab
4. Refresh the page
5. Look at image requests - they should show:
   - ✅ `https://tropical-backend.onrender.com/uploads/...`
   - ❌ NOT `http://localhost:5000/uploads/...`

---

## Quick Commands (Copy-Paste)

```bash
# Create frontend .env
cd frontend
echo "VITE_API_BASE=https://tropical-backend.onrender.com/api" > .env

# Create CMS .env
cd ../tropical-cms
echo "VITE_API_URL=https://tropical-backend.onrender.com" > .env

# Rebuild frontend
cd ../frontend
npm run build

# Rebuild CMS
cd ../tropical-cms
npm run build
```

---

## For Local Development

If you want to switch back to local development later, just change the URLs:

**frontend/.env** (for local):
```env
VITE_API_BASE=http://localhost:5000/api
```

**tropical-cms/.env** (for local):
```env
VITE_API_URL=http://localhost:5000
```

---

## Summary

✅ Create `frontend/.env` with: `VITE_API_BASE=https://tropical-backend.onrender.com/api`
✅ Create `tropical-cms/.env` with: `VITE_API_URL=https://tropical-backend.onrender.com`
✅ Rebuild both: `npm run build`
✅ Redeploy
✅ Images will now load from Render!
