# The Tropical - E-Commerce Platform

## About

The Tropical is a modern e-commerce platform for custom t-shirts and premium apparel. Customers can design their own clothing with our easy-to-use customization tools.

**Website**: https://www.thetropical.in

## Features

- 🎨 **Custom Product Design** - Upload your own designs or choose from admin-approved templates
- 🛒 **Shopping Cart** - Full-featured cart with size selection and quantity management
- 💳 **Secure Payments** - Integrated with Razorpay for safe transactions
- 📧 **Email Notifications** - Automated order confirmations via Resend
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🔍 **SEO Optimized** - Structured data and meta tags for better search visibility

## Tech Stack

This project is built with:

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn-ui
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Payment**: Razorpay
- **Email**: Resend API
- **Image Processing**: Sharp

## Development Setup

### Prerequisites

- Node.js (v18 or higher) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd tropical

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Backend `.env`:**
```
MONGODB_URI=mongodb://localhost:27017/tropical
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@thetropical.in
ADMIN_EMAIL=admin@thetropical.in
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

```sh
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:5000`

## Deployment

### Frontend
Deploy to Netlify, Vercel, or any static hosting service:
```sh
npm run build
```

### Backend
Deploy to Render, Railway, or any Node.js hosting service.

## SEO Features

- ✅ Comprehensive meta tags (title, description, keywords)
- ✅ Open Graph tags for social media sharing
- ✅ Twitter Card support
- ✅ Structured data (JSON-LD) for products and organization
- ✅ Sitemap.xml for search engines
- ✅ Robots.txt for crawler configuration
- ✅ Canonical URLs to prevent duplicate content

## License

All rights reserved © The Tropical
