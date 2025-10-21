# Tropical E-commerce Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (or copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tropical
JWT_SECRET=your-secret-key-here
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

## CMS Setup

1. Navigate to CMS directory:
```bash
cd tropical-cms
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost:5000):
```env
VITE_API_URL=http://localhost:5000
```

4. Start the CMS:
```bash
npm run dev
```

The CMS will run on `http://localhost:5173` (or another port if 5173 is busy)

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5000
```

4. Start the frontend:
```bash
npm run dev
```

The frontend will run on `http://localhost:5174` (or another available port)

## Database Connection

The backend connects to MongoDB using the `MONGODB_URI` in the `.env` file.

Default connection: `mongodb://localhost:27017/tropical`

Make sure MongoDB is running before starting the backend:
```bash
# On Windows (if MongoDB is installed as a service)
net start MongoDB

# On Mac/Linux
mongod
```

## Testing the Connection

1. Start the backend server
2. Visit `http://localhost:5000/api/health` - you should see:
   ```json
   {"status":"ok","message":"Server is running"}
   ```

3. Start the CMS and login
4. Navigate to Products page - you should see products from the database
5. Navigate to Designs page - you should see approved designs

## Customization Feature

### For Admins (CMS):
1. Go to **Products** → Edit a product
2. Check "Enable Customization"
3. Configure options (allow photos, text, front/back)
4. Set pricing for each customization type
5. Go to **Designs** → Upload approved graphics

### For Customers (Frontend):
1. Browse products
2. Click "🎨 Customize This Product" on customizable items
3. Or visit `/customize` to see all customizable products
4. Customize with approved designs, photos, or text
5. Add to cart

## Troubleshooting

### CMS not showing products:
- Check browser console for errors
- Verify backend is running on port 5000
- Check MongoDB connection
- Verify CORS is enabled in backend

### CORS errors:
The backend has CORS enabled by default. If you're running on different ports, this should work automatically.

### MongoDB connection failed:
- Ensure MongoDB is running
- Check the MONGODB_URI in backend/.env
- Verify MongoDB is accessible on the specified port

### Port conflicts:
If ports 5000, 5173, or 5174 are in use, Vite will automatically use the next available port. Check the terminal output for the actual port being used.
