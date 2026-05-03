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
 * PATCH /read-all
 * Mark all notifications for the user as read
 */
router.patch("/read-all", authMiddleware, async (req, res) => {
    try {
        console.log(`[NOTIF] Marking all read for user: ${req.user.userId}`);
        const result = await Notification.updateMany(
            { user: req.user.userId, isRead: false },
            { isRead: true }
        );
        console.log(`[NOTIF] Result:`, result);
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error(`[NOTIF] Read-all error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /clear
 * Clear all notifications for the user
 */
router.delete("/clear", authMiddleware, async (req, res) => {
    try {
        console.log(`[NOTIF] Clearing all for user: ${req.user.userId}`);
        const result = await Notification.deleteMany({ user: req.user.userId });
        console.log(`[NOTIF] Result:`, result);
        res.json({ success: true, message: "Notifications cleared" });
    } catch (error) {
        console.error(`[NOTIF] Clear error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PATCH /:id/read
 * Mark a single notification as read
 */
router.patch("/:id/read", authMiddleware, async (req, res) => {
    try {
        console.log(`[NOTIF] Marking single read: ${req.params.id} for user: ${req.user.userId}`);
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            console.warn(`[NOTIF] Not found: ${req.params.id}`);
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        console.log(`[NOTIF] Success: ${notification._id}`);
        res.json({ success: true, data: notification });
    } catch (error) {
        console.error(`[NOTIF] Single-read error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /:id
 * Delete a single notification
 */
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });
        if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
        res.json({ success: true, message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
