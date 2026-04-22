import React from "react";
import { motion } from "framer-motion";
import Footer from "./Footer";
import Header from "./Header";
import { Link } from "react-router-dom";

const About = () => {
    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const fadeInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const fadeInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: {
            opacity: 1,
            x: 0,
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

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.8, rotate: -10 },
        visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        },
        hover: {
            scale: 1.02,
            transition: { duration: 0.3 }
        }
    };

    return (
        <>
            <Header />
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white text-gray-800"
            >
                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-gradient-to-r from-black via-gray-900 to-blue-900 text-white py-20 text-center relative overflow-hidden"
                >
                    {/* Animated Background Elements */}
                    <motion.div
                        animate={{
                            x: [0, 100, 0],
                            y: [0, 50, 0]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full opacity-10 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            x: [0, -100, 0],
                            y: [0, -50, 0]
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500 rounded-full opacity-10 blur-3xl"
                    />

                    <div className="relative z-10">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-4xl md:text-5xl font-extrabold mb-4"
                        >
                            About <motion.span
                                animate={{ color: ['#60a5fa', '#3b82f6', '#60a5fa'] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="text-blue-400"
                            >
                                Amir Electric
                            </motion.span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-gray-300 max-w-2xl mx-auto"
                        >
                            Delivering reliable electrical solutions with quality, trust, and experience.
                        </motion.p>
                    </div>
                </motion.section>

                {/* About Content */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="py-20"
                >
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        {/* Image */}
                        <motion.div
                            variants={fadeInLeft}
                            className="flex justify-center"
                        >
                            <motion.div
                                variants={imageVariants}
                                whileHover="hover"
                                className="relative"
                            >
                                {/* Glow effect - placed BEHIND the image using z-index */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.3, 0.6, 0.3]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-30 blur-xl -z-10"
                                />
                                {/* Image - placed on top with higher z-index */}
                                <img
                                    src="https://tse4.mm.bing.net/th/id/OIP.7kkWDKF3KjHHWUHBTt3XOAHaFj?pid=Api&h=220&P=0"
                                    alt="Shop"
                                    className="rounded-2xl shadow-xl w-full max-w-md object-cover relative z-10"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Text */}
                        <motion.div
                            variants={fadeInRight}
                            className="text-center md:text-left "
                        >
                            <motion.h2
                                variants={fadeInUp}
                                className="text-3xl font-bold mb-4 text-gray-900"
                            >
                                Who We Are
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-gray-600 mb-4 leading-relaxed"
                            >
                                Amir Electric Store is a trusted name in providing high-quality
                                electrical products for homes, shops, and industries. With years
                                of experience, we focus on delivering reliable and affordable
                                solutions to our customers.
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-gray-600 mb-6 leading-relaxed"
                            >
                                From basic wiring accessories to advanced electrical equipment,
                                we ensure every product meets quality standards and customer expectations.
                            </motion.p>

                            <motion.div
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                className="inline-block"
                            >
                                <Link to="/contact">
                                    <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-lg">
                                        Contact Us
                                    </button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Mission & Vision */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={staggerContainer}
                    className="py-20 bg-gray-50"
                >
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl font-bold mb-12 text-gray-900"
                        >
                            Our Mission & Vision
                        </motion.h2>

                        <div className="grid md:grid-cols-2 gap-10">
                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                className="bg-white p-8 rounded-xl shadow border-t-4 border-blue-500"
                            >
                                <motion.h3
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    className="text-xl font-semibold mb-4"
                                >
                                    Our Mission
                                </motion.h3>
                                <p className="text-gray-600">
                                    To provide reliable electrical products and services that ensure
                                    safety, efficiency, and customer satisfaction.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                className="bg-white p-8 rounded-xl shadow border-t-4 border-blue-500"
                            >
                                <motion.h3
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                                    className="text-xl font-semibold mb-4"
                                >
                                    Our Vision
                                </motion.h3>
                                <p className="text-gray-600">
                                    To become a leading electrical store known for quality, trust,
                                    and innovation in the local market.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>
            </motion.main>
            <Footer />
        </>
    );
};

export default About;