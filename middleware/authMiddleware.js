const jwt = require("jsonwebtoken")

const protect = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization header missing"
        });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // Normalize user payload for controllers
        req.user = {
            ...verified,
            id: verified.userId || verified.id,
            role: verified.role
        };

        if (!req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload"
            });
        }
        next();
    } catch (err) {
        console.error('JWT verification error:', err.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }
};

module.exports = { protect, admin };