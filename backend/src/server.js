require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const productRoutes = require('./routes/product.routes');
const featuredRoutes = require('./routes/featured.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const uploadRoutes = require('./routes/upload.routes');
const heroRoutes = require('./routes/hero.routes');
const contactRoutes = require('./routes/contact.routes');
const designRoutes = require('./routes/design.routes');

// Initialize express app
const app = express();

// Middleware
// Allow multiple origins via env (comma-separated)
const rawOrigins =
  process.env.CORS_ALLOWED_ORIGINS ||
  process.env.FRONTEND_URL ||
  'http://localhost:5173,http://localhost:8080,http://localhost:3000,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:8080,http://127.0.0.1:3000,https://thetropical.in,https://www.thetropical.in';

const allowedOrigins = rawOrigins
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

console.log('CORS Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // allow server-to-server/no-origin and exact matches from the allowlist
    console.log('Request from origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    console.error('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tropical', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/featured', featuredRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/designs', designRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
