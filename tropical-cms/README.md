# Tropical CMS - Admin Panel

A modern admin panel for managing the Tropical e-commerce application. Built with React, Vite, and connected to the Tropical backend API.

## Features

- **Product Management**: Add, edit, and delete products with image uploads
- **Order Management**: View all orders, update order status, and view detailed order information
- **Wheel Items (Featured)**: Manage images that appear in the spinning wheel on the website
- **Image Upload**: Direct image upload functionality with preview
- **Authentication**: Secure admin login with JWT tokens

## Prerequisites

- Node.js 14+ installed
- Tropical backend server running
- Admin user account in the database

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your backend API URL:
```
VITE_API_URL=http://localhost:5000/api
```

## Running the Admin Panel

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Default Access

The admin panel requires an admin user account. Create one through the backend API or database directly with `role: 'admin'`.

## Pages

- **Dashboard**: Overview of products, orders, and recent activity
- **Products**: Full CRUD operations for products
- **Orders**: View and manage customer orders
- **Featured**: Manage wheel/featured items with image uploads

## Tech Stack

- React 19
- Vite 7
- React Router 6
- Axios for API calls
- CSS Modules for styling
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
