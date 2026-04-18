const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized, token missing",
            success: false
        });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to request
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized, invalid or expired token",
            success: false
        });
    }
};

module.exports = ensureAuthenticated;