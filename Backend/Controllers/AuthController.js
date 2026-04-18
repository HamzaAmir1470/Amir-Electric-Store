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

        //  INCLUDE ROLE IN TOKEN
        const jwtToken = jwt.sign(
            {
                _id: user._id,
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

module.exports = {
    signup,
    login
};