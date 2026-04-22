import React from "react";
import { motion, useInView } from "framer-motion";
import owner from "../assets/owner.jpg";
import { Link } from "react-router-dom";

const Home = () => {
    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 50 },
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
            scale: 1.02,
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
            scale: 1.05,
            rotate: 5,
            transition: { duration: 0.3 }
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white text-gray-800"
        >
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="bg-gradient-to-r from-black via-gray-900 to-blue-900 text-white py-20 relative overflow-hidden"
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
                
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
                    >
                        Amir Electric <motion.span 
                            animate={{ color: ['#60a5fa', '#3b82f6', '#60a5fa'] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-blue-400"
                        >
                            Store
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto"
                    >
                        Powering your home and business with reliable electrical products
                        and expert solutions. Quality you can trust.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex justify-center gap-4"
                    >
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-lg"
                        >
                            <Link to="/products">
                                Shop Now
                            </Link>
                        </motion.button>
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="px-6 py-3 border border-blue-400 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition"
                        >
                            <Link to="/products">
                                View Products
                            </Link>
                        </motion.button>
                    </motion.div>
                </div>
            </motion.section>

            {/* Features Section */}
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
                        Why Choose Amir Electric?
                    </motion.h2>

                    <div className="grid gap-10 md:grid-cols-3">
                        <motion.div
                            variants={cardVariants}
                            whileHover="hover"
                            className="bg-white p-8 rounded-xl shadow hover:shadow-xl transition border-t-4 border-blue-500"
                        >
                            <motion.h3 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                className="text-xl font-semibold mb-4"
                            >
                                 Quality Products
                            </motion.h3>
                            <p className="text-gray-600">
                                We provide durable and certified electrical items for long-lasting performance.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            whileHover="hover"
                            className="bg-white p-8 rounded-xl shadow hover:shadow-xl transition border-t-4 border-blue-500"
                        >
                            <motion.h3 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3.5 }}
                                className="text-xl font-semibold mb-4"
                            >
                             Wide Range
                            </motion.h3>
                            <p className="text-gray-600">
                                From wiring to appliances, everything you need in one place.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            whileHover="hover"
                            className="bg-white p-8 rounded-xl shadow hover:shadow-xl transition border-t-4 border-blue-500"
                        >
                            <motion.h3 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                                className="text-xl font-semibold mb-4"
                            >
                                 Trusted Service
                            </motion.h3>
                            <p className="text-gray-600">
                                Expert advice and reliable customer support for all your needs.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Owner Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="py-20 bg-white"
            >
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    {/* Image */}
                    <motion.div
                        variants={fadeInLeft}
                        className="flex flex-col items-center justify-center"
                    >
                        <motion.div
                            variants={imageVariants}
                            whileHover="hover"
                            className="relative"
                        >
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{ 
                                    duration: 3, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute -inset-4 bg-blue-500 rounded-full opacity-20 blur-xl"
                            />
                            <img
                                src={owner}
                                alt="Owner"
                                className="w-72 h-72 object-cover rounded-2xl shadow-xl border-4 border-blue-500 relative z-10"
                            />
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold mt-4 text-gray-900"
                        >
                            ɦαɱƶα αɱเ૨
                        </motion.h2>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        variants={fadeInRight}
                        className="text-center md:text-left"
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl font-bold mb-4 text-gray-900"
                        >
                            Meet the Owner
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-600 mb-4 leading-relaxed"
                        >
                            Amir Electric Store is proudly led by a dedicated professional
                            with years of experience in the electrical industry. Our mission
                            is to provide high-quality products with honest service and
                            customer satisfaction.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-600 mb-6 leading-relaxed"
                        >
                            We believe in trust, reliability, and long-term relationships
                            with our customers. Your needs are our priority.
                        </motion.p>

                        <motion.a
                            href="https://wa.me/923054124410"
                            target="_blank"
                            rel="noreferrer"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-lg"
                        >
                            Contact Owner
                        </motion.a>
                    </motion.div>
                </div>
            </motion.section>

            {/* Call to Action */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
                className="bg-gradient-to-r from-black to-blue-900 text-white py-16 text-center relative overflow-hidden"
            >
                <motion.div
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-3xl"
                />
                <motion.div
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ 
                        duration: 5, 
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute bottom-10 right-10 w-56 h-56 bg-purple-500 rounded-full opacity-20 blur-3xl"
                />
                
                <div className="relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold mb-4"
                    >
                        Need Electrical Solutions?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mb-6 text-gray-300"
                    >
                        Visit Amir Electric Store today and get the best deals on quality products.
                    </motion.p>
                    <motion.button
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-lg"
                    >
                        <Link to="/contact">
                            Contact Us
                        </Link>
                    </motion.button>
                </div>
            </motion.section>
        </motion.main>
    );
};

export default Home;