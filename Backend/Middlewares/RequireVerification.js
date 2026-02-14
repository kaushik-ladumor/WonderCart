const User = require("../Models/User.Model");

const requireVerification = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Fetch user from database to ensure fresh data
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Your email is not verified, please verify your email first.",
            });
        }

        next();
    } catch (error) {
        console.error("RequireVerification Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during verification check",
        });
    }
};

module.exports = requireVerification;
