import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const response = await fetch("http://localhost:8080/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                setShowSuccess(true);
                setFormData({ name: "", email: "", message: "" });
                setTimeout(() => setShowSuccess(false), 5000);
            } else {
                setErrorMessage(result.message || "Failed to send message");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
                            Us
                        </motion.span>
                    </h1>
                    <p className="text-gray-600 mt-2">
                        We're here to help you with all electrical solutions
                    </p>
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
                            ❌ {errorMessage}
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
                            <p className="flex items-start gap-3">
                                <span><strong>Address:</strong> House no 404 A/1 street, 05 ghazi road, near general hospital, Lahore, 05450 Pakistan</span>
                            </p>

                            <p className="flex items-start gap-3">
                                <span><strong>Phone:</strong> +92 322 4385445</span>
                            </p>

                            <p className="flex items-start gap-3">
                                <span><strong>Email:</strong> mh041829@gmail.com</span>
                            </p>

                            <p className="flex items-start gap-3">
                                <span><strong>Hours:</strong> Mon - Sat (9:00 AM - 8:00 PM)</span>
                            </p>
                        </div>

                        <motion.a
                            href="https://wa.me/923224385445"
                            target="_blank"
                            rel="noreferrer"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="inline-flex items-center gap-2 mt-6 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition shadow-lg"
                        >
                            💬 Chat on WhatsApp
                        </motion.a>
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
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <textarea
                                name="message"
                                rows="5"
                                placeholder="Your Message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            />
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    "✉️ Send Message"
                                )}
                            </motion.button>
                        </form>
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
                            title="Amir Electric Store - Ghazi Road Location"
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
                                    <h3 className="font-semibold text-gray-800">Amir Electric Store</h3>
                                    <p className="text-sm text-gray-600">
                                        House no 404 A/1 street, 05 ghazi road, near general hospital
                                    </p>
                                    <p className="text-xs text-gray-500">Lahore, 05450, Pakistan</p>
                                </div>
                            </div>
                            <div className="flex flex-col md:ml-auto gap-2">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-green-600 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Open until 8:00 PM
                                    </span>
                                    <span className="text-gray-500"> +92 322 4385445</span>
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