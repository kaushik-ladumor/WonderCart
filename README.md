# 🛒 WonderCart - The High-Fidelity Multi-Vendor Ecosystem

![WonderCart Hero](./wondercart_hero_1777654337170.png)

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://wondercart-customer.netlify.app)
[![Frontend - Netlify](https://img.shields.io/badge/Frontend-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://wondercart-customer.netlify.app)
[![Backend - Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)

**WonderCart** is a production-grade, multi-vendor e-commerce platform designed for speed, scalability, and premium user experience. Built with a unified backend and specialized high-fidelity frontends for Customers, Sellers, and Administrators.

🔗 **Live Demo:** [https://wondercart-customer.netlify.app](https://wondercart-customer.netlify.app)

---

## ✨ Core Platforms

### 👤 Customer App (`User_app`) - [Deployed on Netlify]
*The ultimate shopping experience with a focus on discovery and seamless checkout.*
- **AI Mood-Based Shopping**: Recommend products based on the user's current mood using advanced sentiment mapping.
- **Visual Search**: Upload an image to find similar products instantly using MobileNet-powered vector embeddings.
- **AI Chatbot**: Intelligent customer support and order tracking powered by **Google Gemini**.
- **Shared Carts**: Collaborate with friends by sharing your shopping cart link.
- **Wallet & Credits**: Internal wallet for instant refunds, promotional credits, and seamless payments.
- **Advanced Order Tracking**: Real-time item-level checklists and visual status timelines.
- **Coupons & Wishlists**: Robust discount system and persistent product wishlists.

### 🏪 Seller Hub (`Seller_app`) - [Deployed on Netlify]
*A powerful command center for vendors to scale their business.*
- **Inventory & Variants**: Manage complex products with multiple color/size variants and granular stock control.
- **Deal Management**: Create and track flash deals and limited-time offers with performance analytics.
- **Store Health Metrics**: Real-time tracking of Customer Satisfaction, Return Rate, and Growth.
- **Sales Analytics**: High-fidelity data visualization with **Recharts** for revenue and order trends.
- **Multi-Stage Fulfillment**: Granular control over the order lifecycle (Pending → Packed → Shipped → Delivered).
- **Merchant Onboarding**: Fast-track application process for new vendors.

### 🛡️ Admin Portal (`Admin_app`) - [Deployed on Netlify]
*Total control over the ecosystem's health and financial flow.*
- **Global Financial Dashboard**: Monitor platform GMV, total earnings, and order distribution.
- **Razorpay Split Engine**: Automated vendor payouts and commission deduction via Razorpay Route.
- **Merchant Oversight**: Review seller applications, manage commissions, and handle vendor relations.
- **Dispute & Suspension**: Case-based system for managing user/seller moderation and account suspensions.
- **System Monitoring**: Real-time platform stats and growth tracking.

---

## 🚀 Advanced Technical Features

### 🤖 AI & Machine Learning Architecture
- **Intent Classification**: Uses `gemini-1.5-flash` to understand customer queries and automate responses.
- **Edge ML**: Integrated **TensorFlow.js** for client-side and server-side image processing.
- **Vector Embeddings**: Cosine similarity matching for high-precision visual search results.

### 🏗️ Backend Architecture (`Backend`) - [Deployed on Render]
- **Order Splitting Engine**: Master orders are automatically split into vendor-specific Sub-Orders during checkout.
- **Real-Time Sync**: Instant notifications and inventory updates via **Socket.io**.
- **Cron Automation**: Scheduled tasks for system maintenance and daily financial reports.
- **Robust Security**: JWT-based Role-Based Access Control (RBAC) and data sanitization.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, DaisyUI, Framer Motion, TanStack Query |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose) |
| **AI / ML** | Google Gemini, TensorFlow.js, Transformers.js |
| **Real-time** | Socket.io |
| **Payments** | Razorpay (Standard & Route Split) |
| **Deployment** | Netlify (Frontend), Render (Backend) |

---

## 📦 Project Structure

```text
WonderCart/
├── Admin_app/        # Platform Control Frontend
├── Seller_app/       # Vendor Management Frontend
├── User_app/         # Customer Shopping Frontend
└── Backend/          # Node.js/Express API & AI Services
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js
- MongoDB Atlas account
- Razorpay API keys (Standard + Route)
- Google Gemini API key
- Cloudinary account

### 2. Environment Configuration
Create a `.env` in the `Backend/` directory:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
RAZORPAY_KEY_ID=your_id
RAZORPAY_KEY_SECRET=your_secret
CLOUDINARY_URL=your_url
```

### 3. Running Locally
```bash
# Start Backend
cd Backend && npm install && npm start

# Start Frontends (Admin/Seller/User)
cd [App_Name] && npm install && npm run dev
```

---

## 📄 License

This project is licensed under the ISC License.

---
*Built with ❤️ for the next generation of e-commerce.*
