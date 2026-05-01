# 🛒 WonderCart - The High-Fidelity Multi-Vendor Ecosystem

![WonderCart Hero](./wondercart_hero_1777654337170.png)

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://wondercart-customer.netlify.app)
[![Frontend - Netlify](https://img.shields.io/badge/Frontend-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://wondercart-customer.netlify.app)
[![Backend - Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)

**WonderCart** is a production-grade, multi-vendor e-commerce platform designed for speed, scalability, and enhanced user experience. Built with a unified backend and specialized high-fidelity frontends for Customers, Sellers, and Administrators.

🔗 **Live Demo:** [https://wondercart-customer.netlify.app](https://wondercart-customer.netlify.app)

---

## 🔐 Authentication Ecosystem
WonderCart implements a robust, unified authentication system across all portals:

- **Google-Based Auth**: Instant onboarding using Firebase Google Social Login for a frictionless experience.
- **Email-Based Auth**: Secure traditional signup with:
  - **OTP Verification**: Real-time email verification via verification codes.
  - **JWT Security**: State-of-the-art token-based session management with refresh tokens.
  - **Role-Based Access**: Automatic redirection and permission gating based on user role (Customer, Seller, Admin).
- **Referral System**: Integrated referral tracking during signup to reward community growth.

---

## 👤 Customer Journey & Features (`User_app`)

### 1. Discovery & Intelligence
- **AI Mood-Based Shopping**: A unique experience where products are curated based on the user's current mood.
- **Visual Search**: Upload any product image to find the closest matches in the catalog using vector-based similarity.
- **Smart Search**: Autocomplete and category-based filtering powered by fuzzy matching.
- **Top Sellers**: Discover high-performing vendors and trending products.

### 2. Gamification & Rewards
- **Reward Points System**: Earn points on every purchase, referral, or platform interaction.
- **Points History**: Transparent tracking of points earned, used, and expiring.
- **Referral Rewards**: Gamified referral system where both the referrer and referee earn benefits.
- **Loyalty Benefits**: Use reward points for exclusive discounts and specialized offers.

### 3. Social & Personalization
- **Shared Carts**: Generate a unique link for your cart to collaborate with friends on a shared shopping list.
- **Wishlist & Favorites**: Save products for later with high-fidelity interaction feedback.
- **Reviews & Ratings**: Comprehensive item-level and seller-level review systems.

### 3. Checkout & Finance
- **Multi-Vendor Cart**: Seamlessly add items from different sellers; the system handles the splitting.
- **Wallet Integration**: Use internal platform credits for faster checkout and instant refund processing.
- **Coupon Engine**: Apply global or seller-specific discounts with real-time validation.
- **Secure Payments**: Powered by **Razorpay** with support for multiple payment methods.

### 4. Post-Purchase Experience
- **Advanced Tracking**: Real-time status updates (Processing → Shipped → Out for Delivery).
- **Item Checklist**: Visual checklist for multi-item orders to track individual fulfillment status.
- **AI Support**: Gemini-powered chatbot to answer order queries and handle support tickets.

---

## 🏪 Seller Lifecycle & Features (`Seller_app`)

### 1. Merchant Onboarding
- **Seller Profile**: Professional storefront setup with custom logos, descriptions, and contact info.
- **Store Health**: Dynamic monitoring of satisfaction rates, monthly growth, and average dispatch times.

### 2. Inventory & Product Management
- **Variant Engine**: Create complex products with multiple colors, sizes, and specific stock counts for each combination.
- **Dynamic Pricing**: Set base prices and discounted "Deal" prices.
- **Media Management**: High-quality product image uploads managed via Cloudinary.

### 3. Promotions & Growth
- **Campaign Manager**: Create flash deals, limited-time offers, and percentage-based discounts.
- **Performance Tracking**: Monitor deal engagement with "Claimed Count" and click-through analytics.

### 4. Order Fulfillment Flow
- **Sub-Order System**: Sellers only see and manage items belonging to their store from a master customer order.
- **Pipeline Management**: Transition orders through a professional fulfillment lifecycle:
  - `Pending` → `Processing` → `Packed` → `Shipped` → `Delivered`.
- **Tracking Details**: Integrated input for shipping provider and tracking numbers.

### 5. Financial Analytics
- **Revenue Charts**: Visual representation of sales trends using high-fidelity **Recharts**.
- **Wallet & Payouts**: Track pending earnings and automated settlement status.

---

## 🛡️ Admin Oversight (`Admin_app`)

- **Platform GMV Control**: Global view of all financial transactions and platform revenue.
- **Seller Moderation**: Review, approve, or reject new seller applications and monitor existing ones.
- **Suspension System**: Case-based management for user/seller disputes and account restrictions.
- **Commission Management**: Configure global commission rates for different categories or vendors.

---

## 🚀 Advanced Technical Architecture

### AI & Machine Learning
- **Gemini Integration**: Uses `gemini-1.5-flash` for intent classification and customer support automation.
- **Edge ML**: **TensorFlow.js** and **MobileNet** for image classification and vector embedding generation.

### Backend & Infrastructure
- **Order Splitting Engine**: Advanced logic to split a single customer checkout into multiple vendor-specific sub-orders.
- **Real-Time Sync**: Instant notifications for orders and status changes via **Socket.io**.
- **Financial Split**: Automated commission deduction and vendor payout calculations via **Razorpay Route**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, DaisyUI, TanStack Query |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose) |
| **AI / ML** | Google Gemini, TensorFlow.js, Transformers.js |
| **Real-time** | Socket.io |
| **Payments** | Razorpay (Standard & Route Split) |
| **Auth** | Firebase Auth (Google), JWT, EmailJS (Verification) |
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
- Firebase Account (for Auth)
- Razorpay API keys
- Google Gemini API key

### 2. Running Locally
```bash
# Start Backend
cd Backend && npm install && npm start

# Start Frontends
cd [App_Name] && npm install && npm run dev
```

---

## 📄 License
This project is licensed under the ISC License.

---
*Built with ❤️ for the next generation of e-commerce.*
