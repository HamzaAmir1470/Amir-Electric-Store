// Middlewares/Auth.js
const jwt = require('jsonwebtoken');
const User = require('../Modals/User');

const ensureAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Fetch the full user object and attach to req
        const user = await User.findById(decoded.userId || decoded._id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;  // ✅ Set the full user object
        req.userId = user._id;  // ✅ Also set userId for convenience

        next();
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = ensureAuthenticated;