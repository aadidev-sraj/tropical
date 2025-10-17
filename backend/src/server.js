require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { syncAllFromStrapi: syncProducts } = require('./controllers/product.controller');
const { syncAllFromStrapi: syncFeatured } = require('./controllers/featured.controller');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const productRoutes = require('./routes/product.routes');
const featuredRoutes = require('./routes/featured.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tropical', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    // Kick off background syncs from Strapi
    try {
      const count = await syncProducts();
      console.log(`Products sync complete. Upserted ${count} items.`);
    } catch (e) {
      console.error('Products sync failed:', e?.message || e);
    }
    try {
      const count = await syncFeatured();
      console.log(`Featured sync complete. Upserted ${count} items.`);
    } catch (e) {
      console.error('Featured sync failed:', e?.message || e);
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/featured', featuredRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

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
