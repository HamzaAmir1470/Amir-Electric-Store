const User = require("../Modals/User.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists. Please login instead.",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role === "admin" ? "admin" : "user";

        // 5. Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: userRole
        });

        await newUser.save();

        return res.status(201).json({
            message: `${userRole === "admin" ? "Admin" : "User"} registered successfully`,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error registering user",
            error: error.message,
            success: false
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
                success: false
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
                success: false
            });
        }

        const jwtToken = jwt.sign(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            message: "Login successful",
            success: true,
            token: jwtToken,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Error logging in user",
            success: false,
            error: error.message
        });
    }
};

// get user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user?._id;
        console.log("Fetching profile for user ID:", userId); // helpful for debugging
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized - No user found",
                success: false
            });
        }
        console.log("Decoded user:", req.user);
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            success: true,
            user
        });

    } catch (error) {
        console.error("Get Profile Error:", error); // ✅ helpful for debugging

        return res.status(500).json({
            message: "Error fetching profile",
            success: false,
            error: error.message
        });
    }
};

// update user profile
const updateUser = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { name } = req.body;

        // 1. Validation
        if (!name) {
            return res.status(400).json({
                message: "Name is required",
                success: false
            });
        }

        // 2. Find and update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name },
            { returnDocument: "after" }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user: updatedUser
        });

    } catch (error) {
        console.error("Update User Error:", error);
        return res.status(500).json({
            message: "Error updating profile",
            success: false,
            error: error.message
        });
    }
};
// Change Password
const changePassword = async (req, res) => {
    try {
        const userId = req.user?._id;

        const { currentPassword, newPassword } = req.body;

        // 1. Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        // 2. Get user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // 3. Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Current password is incorrect",
                success: false
            });
        }

        // 4. Prevent same password reuse
        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "New password must be different",
                success: false
            });
        }

        // 5. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 6. Update
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: "Password changed successfully",
            success: true
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({
            message: "Server error",
            success: false,
            error: error.message
        });
    }
};

// Logout Controller
const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        return res.status(200).json({
            message: "Logged out successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error during logout",
            error: error.message
        });
    }
};


module.exports = {
    signup,
    login,
    logout,
    getProfile,
    changePassword,
    updateUser
};