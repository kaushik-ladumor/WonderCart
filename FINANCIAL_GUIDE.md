# 💳 WonderCart Financial Ecosystem: Razorpay Route & Strategy 1

This document outlines the end-to-end payment, settlement, and withdrawal architecture implemented in WonderCart. 

## 🏗️ Architecture Overview: Strategy 1
WonderCart uses **Strategy 1 (Independent Sub-Order Fulfillment)**. This mean each vendor ships their items independently, and funds are released to them as soon as their specific sub-order is confirmed as **Delivered**.

---

## 🔄 1. The Payment Flow (How Money Moves)

### Step A: Customer Checkout
1. Customer adds items from **Multiple Vendors** into one cart.
2. At checkout, a single **Master Order** is created.
3. The customer pays the total amount via **Razorpay Payment Gateway**.
4. All money initially lands in the **Platform’s Main Razorpay Account**.

### Step B: The Split Engine (Route)
As soon as the payment is verified:
1. The **Split Engine** calculates the **Seller Payout** (Total - Commission - Tax).
2. It calls the **Razorpay Route API** to create **Linked Transfers**.
3. **CRITICAL**: Transfers are created with `on_hold: 1`. 
   - *Result*: The money is pre-allocated to the seller's account but is **LOCKED**. The seller sees it as "Pending" or "On Hold".

### Step C: Fulfillment & Release
1. The Seller ships the sub-order.
2. When the status is updated to **`delivered`** (via Admin or Logistics):
   - The backend triggers the **Release API** (`on_hold: 0`).
   - The funds move from "Pending" to "Settled" in the seller's linked account.
3. Razorpay sweeps these settled funds to the Seller’s bank account on a **T+1 schedule** (Next business day).

---

## 📤 2. How Sellers Withdraw Money
In this marketplace architecture, sellers do not "manually" request a withdrawal like a standard wallet. Instead, the process is automated:

1. **Automatic Settlements**: Once a fund is released from "Hold" (after delivery), it becomes part of the seller's **Settlement Balance** in Razorpay.
2. **Bank Transfer**: Razorpay automatically transfers the balance to the seller's **Registered Bank Account** every day at a specific time (usually midnight).
3. **Visibility**: Sellers can view their current "Held" vs "Released" balances in the **Seller Dashboard > My Wallet**.

---

## 📥 3. How Admin Collects "Money"
The Admin's earnings (Commissions) stay in the **Platform Main Balance**.

1. **Revenue Entry**: Every time a customer pays, the commission portion remains in the Admin account.
2. **Admin Wallet**: The **Admin Hub > Treasury** page shows the total platform earnings.
3. **Withdrawal to Bank**: Admin can click **"Withdraw to Bank"** in the Treasury portal.
   - This initiates an internal bookkeeping entry to move corporate earnings to the platform's primary business bank account (via Razorpay Payouts or manual settlement).

---

## ⏪ 4. Refunds & Cancellations (Clawback)
If a customer cancels a sub-order or requests a refund:

1. **Release Check**: 
   - If funds were **On Hold**: The transfer is simply reversed. No money ever touched the seller.
   - If funds were **Released**: The system initiates a **Clawback**, pulling the money back from the seller's next settlement cycle to pay the customer.
2. **Customer Credit**: Razorpay returns the amount to the customer's original payment method (UPI/Card/Wallet).

---

## 🛠️ Configuration & Test Mode
To test this flow without real money:
- **Test Mode**: Use Razorpay Test Key ID/Secret.
- **Linked Accounts**: Use dummy IFSC `RAZR0000001` for seller bank registration.
- **Webhook**: Ensure the server endpoint `/order/webhook` is registered in the Razorpay Dashboard to handle real-time status updates.

---
*Created by WonderCart Advanced Agentic Coding Team.*
