const Notification = require("../Models/Notification.Model");
const User = require("../Models/User.Model");

/**
 * Send notification to a specific user and emit via socket
 * @param {string} userId - Target user ID
 * @param {string} role - role ('seller', 'buyer', 'admin')
 * @param {string} type - Notification type
 * @param {string} message - Content
 * @param {string} [orderId] - Optional associated order ID
 */
const sendNotification = async ({ userId, role, type, message, orderId = null }) => {
    try {
        // 1. Save to Database
        const notification = new Notification({
            user: userId,
            role,
            type,
            message,
            orderId
        });
        await notification.save();

        // 2. Emit via Socket.io if available
        if (global.io) {
            // User-specific room
            global.io.to(userId.toString()).emit("notification", notification);
            
            // Role-specific room (optional, good for broadcasting to all admins)
            if (role === 'admin') {
                global.io.to("admin_room").emit("notification", notification);
            }
        }
        
        return notification;
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

/**
 * Notify all admins
 */
const notifyAdmins = async ({ type, message, orderId = null }) => {
    try {
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await sendNotification({
                userId: admin._id,
                role: 'admin',
                type,
                message,
                orderId
            });
        }
    } catch (error) {
        console.error("Error notifying admins:", error);
    }
};

module.exports = { sendNotification, notifyAdmins };
