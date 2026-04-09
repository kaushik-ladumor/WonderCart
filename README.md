# WonderCart - Multi-Vendor E-Commerce Platform

WonderCart is a high-fidelity, production-grade multi-vendor e-commerce ecosystem featuring specialized portals for Customers, Sellers, and Admins. It is built on a robust Node.js backend with real-time socket synchronization and an advanced Razorpay-powered financial split engine.

## 🚀 Key Features

### 👤 Customer Experience (User_app)
- **High-Fidelity Checkout**: A premium, streamlined checkout process with real-time stock and price validation.
- **Advanced Tracking**: Detailed "Active Consignments" view with item-level checklists and visual status timelines.
- **Smart Search**: Autocomplete and category-based search powered by fuzzy matching.
- **Wallet Integration**: Pay using platform credits (Wallet) or external methods (Razorpay).

### 🏪 Seller Hub (Seller_app)
- **Inventory Management**: Create products with multiple color/size variants and granular stock control.
- **Order Fulfillment**: Manage sub-orders, update statuses (Processing -> Packed -> Shipped -> Delivered), and provide tracking details.
- **Financial Dashboard**: Real-time sales analytics, revenue charts, and automated payout tracking.
- **Store Health**: Metrics for customer satisfaction and delivery performance.

### 🛡️ Admin Control (Admin_app)
- **Platform Oversight**: Monitor global GMV, order distribution, and user growth.
- **Vendor Management**: Review seller applications and manage global platform commissions.
- **Razorpay Split Engine**: Visualization of the T+1 settlement flow and automated vendor payouts.

## 🛠️ Technical Implementation

### Backend Architecture
- **Monorepo Structure**: Separate apps for Admin, Seller, and User sharing a unified Backend API.
- **Order Splitting Engine**: Master orders are automatically split into vendor-specific Sub-Orders during checkout.
- **Real-Time Synchronization**: Socket.io integration for instant order status updates and stock notifications.
- **Data Persistence**: Robust MongoDB schemas with persistent snapshots (e.g., item images saved at checkout to prevent future broken links).

### Security & Financials
- **JWT Authentication**: Role-based access control (RBAC) across all portals.
- **Razorpay Route**: Specialized integration for holding and releasing vendor payments based on delivery status.
- **Automated Wallets**: Instant internal settlements for returns and cancellations.

## 📦 Project Structure
```text
WonderCart/
├── Backend/          # Node.js/Express API & Models
├── User_app/         # Customer Frontend (React)
├── Seller_app/       # Vendor Frontend (React)
└── Admin_app/        # Platform Control Frontend (React)
```

## ⚙️ Setup Instructions
1. **Prerequisites**: Node.js v18+, MongoDB, Razorpay Account.
2. **Environment**: Create a `.env` in the `Backend/` directory with `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
3. **Installation**: Run `npm install` in all directories.
4. **Execution**: Start the backend and then your desired frontend apps using `npm run dev`.

---
*Built with passion for premium e-commerce experiences.*
