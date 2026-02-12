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

    // 🚨 Guard against bad tokens
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let email = decoded.email;
    if (!email && decoded.userId) {
      const user = await User.findById(decoded.userId).select("email");
      if (user) email = user.email;
    }

    req.user = {
      userId: decoded.userId,
      email,
      role: decoded.role,
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
