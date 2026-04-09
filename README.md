# 🛒 WonderCart: Multitenancy Marketplace

WonderCart is a high-performance multitenancy e-commerce platform designed with a focus on granular vendor management and secure financial orchestration.

## 📁 Project Structure
- **/Backend**: Node.js (Express) server with MongoDB.
- **/User_app**: Customer-facing React storefront.
- **/Seller_app**: Dedicated vendor management portal.
- **/Admin_app**: Platform governance and financial treasury hub.

## 💳 Financial & Payment System
The platform utilizes **Razorpay Route** for automated split payments using **Strategy 1 (Independent Payouts)**.

### Quick Links
- **[Payment & Withdrawal Guide](./FINANCIAL_GUIDE.md)**: Detailed explanation of how money moves, how sellers are paid, and the withdrawal process.
- **[API Documentation](./Backend/README.md)**: Backend endpoint specifications.

## 🚀 Key Features
- **Split Order Engine**: Single checkout, multiple independent vendor sub-orders.
- **Held Transfers**: Funds are locked until delivery to protect the platform.
- **Automated Settlements**: T+1 bank settlements for vendors.
- **Granular Refunds**: Independent sub-order returns without affecting the whole master order.

---
*Built with ❤️ by its developers.*
