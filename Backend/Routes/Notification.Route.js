const express = require("express");
const router = express.Router();
const Notification = require("../Models/Notification.Model");
const authMiddleware = require("../Middlewares/Auth");

/**
 * GET /
 * Get all notifications for the current user
 */
router.get("/", authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PATCH /:id/read
 * Mark a single notification as read
 */
router.patch("/:id/read", authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /clear
 * Clear all notifications for the user
 */
router.delete("/clear", authMiddleware, async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user.userId });
        res.json({ success: true, message: "Notifications cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
