const jwt = require("jsonwebtoken");
const User = require("../Models/User.Model");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    let email = decoded.email;
    if (!email) {
      // If email missing in token, fetch from DB
      const user = await User.findById(decoded.userId).select("email");
      if (user) email = user.email;
    }

    req.user = {
      userId: decoded.userId,
      email: email,
      role: decoded.role,
    };
    console.log("Authenticated User:", req.user);

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
      message: "Invalid authentication token",
    });
  }
};

module.exports = authMiddleware;
