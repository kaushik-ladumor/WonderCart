// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["seller", "buyer", "admin"],
            required: true,
        },
        type: String,
        message: String,
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
