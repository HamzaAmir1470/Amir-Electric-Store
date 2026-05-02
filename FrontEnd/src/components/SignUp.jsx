import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import API_URL from "../config";

const SignUp = () => {
    const [signupInfo, setSignupInfo] = React.useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copySignupInfo = { ...signupInfo };
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        const { name, email, password, confirmPassword } = signupInfo;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return handleError("All fields are required");
        }

        if (password !== confirmPassword) {
            return handleError("Passwords do not match");
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            let data = {};
            try {
                data = await response.json();
            } catch (err) {
                console.log("Invalid JSON response");
            }

            if (!response.ok) {
                setLoading(false);
                return handleError(data?.message || "Sign up failed");
            }

            setSignupInfo({
                name: "",
                email: "",
                password: "",
                confirmPassword: ""
            });

            if (response.ok) {
                handleSuccess(data?.message || "Sign up successful!");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1000);
            }
        } catch (error) {
            console.error("Signup Error:", error);
            handleError("Server error. Please try again later.");
            setLoading(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
                duration: 0.6
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 }
        }
    };

    const buttonVariants = {
        idle: { scale: 1 },
        hover: {
            scale: 1.02,
            transition: { duration: 0.2 }
        },
        tap: { scale: 0.98 }
    };

    const loadingSpinnerVariants = {
        animate: {
            rotate: 360,
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    const floatingVariants = {
        animate: {
            y: [0, -15, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    // Password strength calculation
    const getPasswordStrength = () => {
        const password = signupInfo.password;
        if (!password) return { strength: 0, label: "", color: "", bg: "", width: "0%" };
        if (password.length < 6) return { strength: 1, label: "Weak", color: "text-red-500", bg: "bg-red-100", width: "25%" };
        if (password.length < 10) return { strength: 2, label: "Medium", color: "text-yellow-500", bg: "bg-yellow-100", width: "50%" };
        return { strength: 3, label: "Strong", color: "text-green-500", bg: "bg-green-100", width: "100%" };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-900 to-blue-900 p-4 relative"
        >
            {/* Toast Container - Outside card, at root level */}
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            {/* Animated Background Elements */}
            <motion.div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <motion.div
                    variants={floatingVariants}
                    animate="animate"
                    className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
                />
                <motion.div
                    variants={floatingVariants}
                    animate="animate"
                    className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
                    transition={{ delay: 0.5 }}
                />
                <motion.div
                    variants={floatingVariants}
                    animate="animate"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"
                    transition={{ delay: 1 }}
                />
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md relative z-10"
            >
                <motion.div
                    variants={cardVariants}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8"
                >
                    {/* Logo / Header */}
                    <motion.div variants={itemVariants} className="text-center">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4"
                        >
                            <span className="text-2xl text-white font-bold">⚡</span>
                        </motion.div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                            <Link to="/" className="hover:text-blue-600 transition-colors">
                                Amir Electric Store
                            </Link>
                        </h2>
                        <p className="text-gray-500 text-sm sm:text-base">
                            Create your account
                        </p>
                    </motion.div>

                    {/* Form */}
                    <motion.form onSubmit={handleSignUp} className="space-y-4 mt-6">
                        {/* Name Field */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <motion.input
                                whileFocus={{ scale: 1.01 }}
                                onChange={handleChange}
                                type="text"
                                name="name"
                                value={signupInfo.name}
                                placeholder="Enter your name"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </motion.div>

                        {/* Email Field */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <motion.input
                                whileFocus={{ scale: 1.01 }}
                                onChange={handleChange}
                                type="email"
                                name="email"
                                value={signupInfo.email}
                                placeholder="Enter your email"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </motion.div>

                        {/* Password Field */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <motion.input
                                    whileFocus={{ scale: 1.01 }}
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={signupInfo.password}
                                    onChange={handleChange}
                                    placeholder="Create password"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            
                            {/* Password Strength Indicator */}
                            <AnimatePresence>
                                {signupInfo.password && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-xs ${passwordStrength.color}`}>
                                                Password Strength: {passwordStrength.label}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {signupInfo.password.length} characters
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: passwordStrength.width }}
                                                className={`h-full rounded-full ${
                                                    passwordStrength.strength === 1 ? "bg-red-500" :
                                                    passwordStrength.strength === 2 ? "bg-yellow-500" : "bg-green-500"
                                                }`}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Confirm Password Field */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <motion.input
                                    whileFocus={{ scale: 1.01 }}
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={signupInfo.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base pr-12 ${
                                        signupInfo.confirmPassword && signupInfo.password !== signupInfo.confirmPassword
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <AnimatePresence>
                                {signupInfo.confirmPassword && signupInfo.password !== signupInfo.confirmPassword && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-1 text-xs text-red-500"
                                    >
                                        Passwords do not match
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            variants={buttonVariants}
                            initial="idle"
                            whileHover="hover"
                            whileTap="tap"
                            animate={loading ? "idle" : undefined}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base relative overflow-hidden"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <motion.svg
                                        variants={loadingSpinnerVariants}
                                        animate="animate"
                                        className="w-5 h-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </motion.svg>
                                    Creating Account...
                                </span>
                            ) : (
                                "Sign Up"
                            )}
                        </motion.button>
                    </motion.form>

                    {/* Footer */}
                    <motion.div variants={itemVariants} className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{" "}
                            <Link to="/login" className="text-blue-500 font-medium hover:underline hover:text-blue-600 transition-colors">
                                Login
                            </Link>
                        </p>
                    </motion.div>

                    {/* Terms and Privacy */}
                    <motion.div 
                        variants={itemVariants}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-4 text-center"
                    >
                        <p className="text-xs text-gray-400">
                            By signing up, you agree to our{" "}
                            <Link to="/terms" className="text-blue-500 hover:underline">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link to="/privacy" className="text-blue-500 hover:underline">
                                Privacy Policy
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>

                {/* Decorative Footer */}
                <motion.p
                    variants={itemVariants}
                    className="text-center text-gray-400 text-xs mt-6"
                >
                    © 2026 Amir Electric Store. All rights reserved.
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default SignUp;