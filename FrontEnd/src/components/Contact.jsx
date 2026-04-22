import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { jwtDecode } from "jwt-decode";
import { useSettings } from "../components/SettingContext"; // Adjust the path as needed

const Contact = () => {
    const navigate = useNavigate();
    const { settings, loading: settingsLoading } = useSettings();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const getUserFromToken = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            const decoded = jwtDecode(token);
            console.log("Decoded token:", decoded);
            return {
                name: decoded.name,
                email: decoded.email
            };
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    };

    useEffect(() => {
        const user = getUserFromToken();

        if (user) {
            setIsAuthenticated(true);
            setFormData((prev) => ({
                ...prev,
                name: user.name || "",
                email: user.email || ""
            }));
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if user is authenticated
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const response = await fetch("http://localhost:8080/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                setShowSuccess(true);
                setFormData({ name: formData.name, email: formData.email, message: "" });
                setTimeout(() => setShowSuccess(false), 5000);
            } else {
                if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem("token");
                    navigate("/login");
                } else {
                    setErrorMessage(result.message || "Failed to send message");
                }
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to clean WhatsApp number (remove non-digits)
    const getWhatsAppNumber = (phone) => {
        if (!phone) return "";
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');
        // Remove leading '92' or '0' if present for WhatsApp link
        let whatsappNumber = cleaned;
        if (whatsappNumber.startsWith('92')) {
            whatsappNumber = whatsappNumber;
        } else if (whatsappNumber.startsWith('0')) {
            whatsappNumber = '92' + whatsappNumber.substring(1);
        } else if (!whatsappNumber.startsWith('92')) {
            whatsappNumber = '92' + whatsappNumber;
        }
        return whatsappNumber;
    };

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        },
        hover: {
            y: -10,
            transition: { duration: 0.2 }
        }
    };

    const buttonVariants = {
        hover: {
            scale: 1.05,
            transition: { duration: 0.2 }
        },
        tap: {
            scale: 0.95,
            transition: { duration: 0.1 }
        }
    };

    if (settingsLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading contact information...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-50 min-h-screen py-16"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900">
                        Contact <motion.span
                            animate={{ color: ['#3b82f6', '#2563eb', '#3b82f6'] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-blue-500"
                        >
                            {settings.companyName || "Us"}
                        </motion.span>
                    </h1>
                    <p className="text-gray-600 mt-2">
                        We're here to help you with all electrical solutions
                    </p>
                    {!isAuthenticated && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-amber-600 mt-3 text-sm bg-amber-50 inline-block px-4 py-2 rounded-full"
                        >
                            Please login to send us a message
                        </motion.p>
                    )}
                </motion.div>

                {/* Success Message */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.9 }}
                            className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
                        >
                            Message sent successfully! We'll contact you soon.
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.9 }}
                            className="fixed top-20 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
                        >
                            {errorMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10"
                >
                    {/* Contact Info */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        className="bg-white p-8 rounded-xl shadow border-t-4 border-blue-500"
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="text-2xl font-semibold mb-6"
                        >
                            Get in Touch
                        </motion.h2>

                        <div className="space-y-4 text-gray-700">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <div>
                                    <strong className="block text-gray-900">Address</strong>
                                    <span>{settings.companyAddress || "Loading..."}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                <div>
                                    <strong className="block text-gray-900">Phone</strong>
                                    <span>{settings.companyPhone || "Loading..."}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                <div>
                                    <strong className="block text-gray-900">Email</strong>
                                    <a href={`mailto:${settings.companyEmail}`} className="text-blue-600 hover:text-blue-700">
                                        {settings.companyEmail || "Loading..."}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div>
                                    <strong className="block text-gray-900">Hours</strong>
                                    <span>Mon - Sat (9:00 AM - 8:00 PM)</span>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Button */}
                        {settings.companyPhone && (
                            <motion.a
                                href={`https://wa.me/${getWhatsAppNumber(settings.companyPhone)}`}
                                target="_blank"
                                rel="noreferrer"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                className="inline-flex items-center gap-2 mt-6 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.588 2.122.898 3.149.898h.003c3.18 0 5.767-2.586 5.768-5.766.001-3.18-2.585-5.766-5.767-5.766zm3.392 8.244c-.147.413-.867.813-1.186.855-.303.04-.64.046-1.023-.066-.278-.082-.568-.19-.86-.334-.768-.38-1.48-1.09-1.898-1.788-.15-.25-.32-.53-.445-.827-.12-.286-.12-.527-.09-.722.02-.144.072-.28.144-.4.072-.12.156-.22.252-.313.074-.074.12-.148.168-.222.048-.074.084-.148.096-.222.024-.148-.012-.296-.096-.42-.084-.123-.19-.27-.31-.42-.24-.3-.52-.63-.84-.86-.28-.2-.6-.34-.92-.34-.12 0-.24.012-.36.036-.36.06-.7.24-.96.48-.4.37-.66.85-.72 1.38-.06.53.06 1.07.34 1.55.18.3.4.58.64.84.32.34.68.64 1.06.9.38.26.78.48 1.18.66.4.18.8.3 1.2.36.2.03.4.05.6.05.36 0 .72-.06 1.06-.18.34-.12.66-.3.94-.54.28-.24.5-.54.66-.88.16-.34.24-.7.24-1.06 0-.18-.04-.36-.12-.52-.08-.16-.2-.3-.34-.42-.14-.12-.3-.22-.48-.3-.18-.08-.38-.14-.58-.18-.2-.04-.4-.08-.6-.12-.2-.04-.4-.1-.58-.18-.18-.08-.34-.2-.46-.36-.12-.16-.18-.36-.18-.58 0-.22.06-.44.18-.62.12-.18.28-.34.48-.46.2-.12.44-.18.68-.18.12 0 .24.02.36.06.12.04.24.1.34.18.1.08.18.18.24.3.06.12.1.26.1.4 0 .16-.04.32-.12.46-.08.14-.2.26-.34.34-.14.08-.3.14-.46.16-.16.02-.32.02-.46-.02-.08-.02-.16-.06-.24-.1-.08-.04-.14-.1-.2-.16-.06-.06-.1-.12-.12-.2-.02-.08-.02-.16.02-.24.04-.08.1-.14.18-.18.08-.04.16-.06.24-.06.04 0 .08.02.12.04.04.02.08.06.1.1.02.04.04.08.04.12.02.04.02.08 0 .12-.02.04-.06.08-.1.1-.04.02-.08.04-.12.04-.04 0-.08-.02-.12-.04-.04-.02-.08-.06-.1-.1-.02-.04-.04-.08-.04-.12-.02-.04-.02-.08 0-.12.02-.04.06-.08.1-.1.04-.02.08-.04.12-.04.04 0 .08.02.12.04.04.02.08.06.1.1.02.04.04.08.04.12.02.04.02.08 0 .12-.02.04-.06.08-.1.1-.04.02-.08.04-.12.04-.04 0-.08-.02-.12-.04-.04-.02-.08-.06-.1-.1-.02-.04-.04-.08-.04-.12-.02-.04-.02-.08 0-.12.02-.04.06-.08.1-.1.04-.02.08-.04.12-.04.04 0 .08.02.12.04.04.02.08.06.1.1.02.04.04.08.04.12.02.04.02.08 0 .12z" />
                                </svg>
                                Chat on WhatsApp
                            </motion.a>
                        )}
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        className="bg-white p-8 rounded-xl shadow"
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="text-2xl font-semibold mb-6"
                        >
                            Send Message
                        </motion.h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    readOnly={isAuthenticated}
                                    required
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${!isAuthenticated ? "bg-gray-50 cursor-pointer" : ""
                                        }`}
                                />
                                {!isAuthenticated && (
                                    <div className="absolute inset-0 bg-transparent cursor-pointer"
                                        onClick={() => navigate("/login")} />
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Your Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    readOnly={isAuthenticated}
                                    required
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${!isAuthenticated ? "bg-gray-50 cursor-pointer" : ""
                                        }`}
                                />
                                {!isAuthenticated && (
                                    <div className="absolute inset-0 bg-transparent cursor-pointer"
                                        onClick={() => navigate("/login")} />
                                )}
                            </div>
                            <div className="relative">
                                <textarea
                                    name="message"
                                    rows="5"
                                    placeholder="Your Message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${!isAuthenticated ? "bg-gray-50 cursor-pointer" : ""
                                        }`}
                                />
                                {!isAuthenticated && (
                                    <div className="absolute inset-0 bg-transparent cursor-pointer"
                                        onClick={() => navigate("/login")} />
                                )}
                            </div>
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                className={`w-full py-2 rounded-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${isAuthenticated
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "bg-gray-400 text-white cursor-pointer hover:bg-gray-500"
                                    }`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    !isAuthenticated ? "Login to Send Message" : "Send Message"
                                )}
                            </motion.button>
                        </form>

                        {!isAuthenticated && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-sm text-gray-500 mt-4"
                            >
                                👋 <button
                                    onClick={() => navigate("/login")}
                                    className="text-blue-500 hover:text-blue-600 font-medium"
                                >
                                    Click here to login
                                </button> and send us a message
                            </motion.p>
                        )}
                    </motion.div>
                </motion.div>

                {/* Google Map Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="max-w-7xl mx-auto px-6 mt-12"
                >
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl shadow overflow-hidden"
                    >
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3400.123456789012!2d74.3416966!3d31.4706414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391907005013a591%3A0xa8ccd7183fc8f079!2sAmir%20Electric%20Store!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                            width="100%"
                            height="350"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`${settings.companyName} - Location`}
                            className="rounded-lg"
                        />
                    </motion.div>

                    {/* Store Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
                    >
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xl">📍</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{settings.companyName || "Amir Electric Store"}</h3>
                                    <p className="text-sm text-gray-600">
                                        {settings.companyAddress || "Loading address..."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col md:ml-auto gap-2">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-green-600 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Open until 8:00 PM
                                    </span>
                                    <span className="text-gray-500">{settings.companyPhone || "Loading..."}</span>
                                </div>
                                <motion.a
                                    href="https://www.google.com/maps/place/Amir+Electric+Store/@31.4706414,74.3416966,17z/data=!3m1!4b1!4m6!3m5!1s0x391907005013a591:0xa8ccd7183fc8f079!8m2!3d31.4706369!4d74.3442715!16s%2Fg%2F11vrhpn01f"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 self-end"
                                >
                                    🗺️ Get Directions on Google Maps →
                                </motion.a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.main>
            <Footer />
        </>
    );
};

export default Contact;