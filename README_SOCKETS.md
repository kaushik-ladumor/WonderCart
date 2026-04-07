# WonderCart Real-Time Socket Documentation

This document outlines the real-time functionality implemented across the WonderCart platform using Socket.io.

## Infrastructure
- **Provider**: `User_app/src/context/SocketProvider.jsx` manages the central connection.
- **Connection Logic**: 
  - Connects only when the user is logged in.
  - Dynamically updates the token on reconnection.
  - Joins specific buyer rooms (`buyer-{userId}`) for targeted updates.
  - Joins cart rooms (`cart-{userId}`) for localized cart notifications.

## Real-Time Events Map

### 1. Product Detail Page
- **`stock-update`**: Triggers when a seller updates product stock. Automatically updates the "In Stock" indicators and quantity limits on the detail page.
- **`price-change`**: Triggers when a product price is modified. Specifically updates the displayed prices and shows a toast notification if the price drops while the user is viewing.

### 2. Cart Page
- **`cart-update`**: Triggers on any cart modification (add/remove/modify). Syncs the UI across all tabs.
- **`stock-low`**: Emitted when a user views their cart and an item they have has less than 5 units remaining in global stock. Shows a critical "Hurry!" toast.
- **`item-reserved`**: Emitted when a user successfully adds an item to their cart, notifying them that the item is reserved for a limited time.

### 3. Checkout Page
- **`payment-success`**: Emitted after successful Razorpay or Wallet payment verification. Automatically redirects the user to the Order Confirmation page and clears the local session state.
- **`payment-fail`**: Emitted if payment verification or COD serviceability check fails. Re-enables the "Place Order" button and shows a detailed error toast.

### 4. Order Tracking Page
- **`order-status-update`**: (Standard) Triggers when seller updates order status (e.g., CONFIRMED, SHIPPED).
- **`delivery-update`**: Triggers for specific delivery milestones (e.g., OUT_FOR_DELIVERY).

### 5. Notifications Bell (Navbar)
- **`notification`**: Generic notification event for product approvals, seller payouts, etc.
- **`notification:new`**: Dedicated event for new alerts requiring immediate attention, triggering the unread dot and adding to the dropdown list.

### 6. Wallet Updates
- **`wallet-update`**: (Profile Page) Instantly updates the visible wallet balance and shows a success toast on top-up.

---

## Technical Notes
- **Room Management**: The backend uses `SocketIo.js` to handle `connection` and `disconnection` events, placing users in rooms based on their IDs and roles.
- **Security**: The socket connection uses JWT authentication (token sent in `auth` handshake) to ensure users only receive updates meant for them.
- **Consistency**: All events follow a kebab-case or colon-separated naming convention as requested for clarity.
