const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log("JWT ROLE:", req.user.role);
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }
        next();
    };
};

module.exports = authorizeRoles;
