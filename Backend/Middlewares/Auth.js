const jwt = require("jsonwebtoken");
const User = require("../Models/User.Model");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("role isSuspended isBanned email");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account no longer exists",
      });
    }

    // 🔒 Trust & Safety Protection
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "This account has been permanently terminated due to policy violations.",
      });
    }

    if (user.isSuspended && user.role === "seller" && !req.path.includes("/appeal")) {
      return res.status(403).json({
        success: false,
        message: "Access blocked. Your seller account is currently suspended for review.",
      });
    }

    req.user = {
      userId: decoded.userId,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or malformed token",
    });
  }
};

module.exports = authMiddleware;
