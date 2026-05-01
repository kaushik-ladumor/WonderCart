# 🛒 WonderCart - The High-Fidelity Multi-Vendor Ecosystem

![WonderCart Hero](./wondercart_hero_1777654337170.png)

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Flash-4285F4?logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

**WonderCart** is a production-grade, multi-vendor e-commerce platform designed for speed, scalability, and premium user experience. Built with a unified backend and specialized frontends for Customers, Sellers, and Administrators, WonderCart integrates cutting-edge AI features, real-time synchronization, and a robust financial split engine.

---

## ✨ Core Ecosystem

The platform is divided into three distinct, high-fidelity React applications:

### 👤 Customer Experience (`User_app`)
- **Premium UI/UX**: Built with React 19 and Tailwind CSS 4 for a buttery-smooth, modern shopping experience.
- **AI Chatbot**: Integrated Gemini-powered AI to help users find products and track orders via natural language.
- **Smart Checkout**: Real-time stock validation, automated tax calculation, and Razorpay-powered secure payments.
- **Wallet System**: Seamless internal credits for instant refunds and promotional balances.

### 🏪 Seller Hub (`Seller_app`)
- **Inventory Control**: Granular management of product variants (colors, sizes) with real-time stock tracking.
- **Fulfillment Pipeline**: Multi-stage order processing (Pending → Shipped → Delivered) with tracking integration.
- **Advanced Analytics**: Real-time sales charts and revenue insights powered by Recharts.
- **Merchant Onboarding**: Streamlined application process for new vendors.

### 🛡️ Admin Control (`Admin_app`)
- **Global Oversight**: Monitor Platform GMV, order volume, and seller performance from a centralized command center.
- **Vendor Management**: Global commission configuration and seller verification workflows.
- **Financial Split Engine**: Advanced T+1 settlement logic and automated payout monitoring via Razorpay Route.
- **System Health**: Real-time logs and user growth analytics.

---

## 🚀 Advanced Technical Features

### 🤖 AI & Machine Learning
- **Gemini Integration**: Uses `gemini-1.5-flash` for intelligent intent classification and customer support.
- **Edge ML**: Integrated TensorFlow.js and MobileNet for future-ready image recognition and product classification.
- **Automated Summarization**: AI-driven product description enhancement and review analysis.

### 🏗️ Backend Architecture
- **Unified API**: A robust Express.js backend serving all three platforms with Role-Based Access Control (RBAC).
- **Socket Synchronization**: Real-time inventory and order status updates using Socket.io.
- **Financial Split Engine**: Master orders are intelligently split into vendor-specific sub-orders with automated commission deduction.
- **Cron Automation**: Automated system maintenance, daily reports, and scheduled payout triggers.

### 🔒 Security & Reliability
- **JWT Auth**: Secure, state-of-the-art authentication across all platforms.
- **Data Integrity**: Persistent snapshots of product data at checkout to ensure historical accuracy (e.g., price and images).
- **Cloud Storage**: Seamless media management via Cloudinary and Multer.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, DaisyUI 5, Framer Motion, TanStack Query |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose) |
| **AI / ML** | Google Gemini, TensorFlow.js, Transformers.js |
| **Real-time** | Socket.io |
| **Payments** | Razorpay (Standard & Route Split) |
| **DevOps** | Vercel (Frontend), Cron Jobs |

---

## 📦 Project Structure

```text
WonderCart/
├── Admin_app/        # Platform Control Frontend (React)
├── Backend/          # Node.js/Express API & AI Services
├── Seller_app/       # Vendor Management Frontend (React)
└── User_app/         # Customer Shopping Frontend (React)
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v20+)
- MongoDB Atlas account
- Razorpay API keys
- Google Gemini API key
- Cloudinary account

### 2. Backend Setup
```bash
cd Backend
npm install
# Create .env file with your credentials
npm start
```

### 3. Frontend Setup (Repeat for User, Seller, and Admin)
```bash
cd [App_Name]
npm install
npm run dev
```

---

## 📄 License

This project is licensed under the ISC License.

---
*Built with ❤️ for the next generation of e-commerce.*
