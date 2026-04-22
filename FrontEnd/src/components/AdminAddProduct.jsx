import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiPackage, FiDollarSign, FiTag, FiList, FiSave, FiImage,
    FiArchive, FiTrendingUp, FiShoppingBag, FiCheckCircle,
    FiAlertCircle
} from "react-icons/fi";
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from "../utils";

const AdminAddProduct = () => {
    const [product, setProduct] = useState({
        name: "",
        purchasePrice: "",
        wholesalePrice: "",
        retailPrice: "",
        stock: "",
        category: "",
        description: "",
        imageUrl: ""
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const categories = [
        "Electronics",
        "Motors",
        "Bearings",
        "Belts",
        "Rotors",
        "Wires",
        "Tools",
        "Clothing",
        "Books",
        "Home & Garden",
        "Sports",
        "Toys",
        "Beauty",
        "Automotive"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({
            ...product,
            [name]: value
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ""
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!product.name.trim()) newErrors.name = "Product name is required";
        if (!product.purchasePrice || parseFloat(product.purchasePrice) <= 0) newErrors.purchasePrice = "Valid purchase price is required";
        if (!product.wholesalePrice || parseFloat(product.wholesalePrice) <= 0) newErrors.wholesalePrice = "Valid wholesale price is required";
        if (!product.retailPrice || parseFloat(product.retailPrice) <= 0) newErrors.retailPrice = "Valid retail price is required";
        if (!product.stock || parseInt(product.stock) < 0) newErrors.stock = "Valid stock quantity is required";
        if (!product.category) newErrors.category = "Please select a category";
        if (!product.description.trim()) newErrors.description = "Product description is required";

        if (product.purchasePrice && product.wholesalePrice && product.retailPrice) {
            const purchase = parseFloat(product.purchasePrice);
            const wholesale = parseFloat(product.wholesalePrice);
            const retail = parseFloat(product.retailPrice);

            if (wholesale <= purchase) {
                newErrors.wholesalePrice = "Wholesale price should be greater than purchase price";
            }
            if (retail <= wholesale) {
                newErrors.retailPrice = "Retail price should be greater than wholesale price";
            }
            if (retail <= purchase) {
                newErrors.retailPrice = "Retail price should be greater than purchase price";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateMargins = () => {
        const purchase = parseFloat(product.purchasePrice) || 0;
        const wholesale = parseFloat(product.wholesalePrice) || 0;
        const retail = parseFloat(product.retailPrice) || 0;

        const wholesaleMargin = purchase > 0 ? ((wholesale - purchase) / purchase * 100).toFixed(2) : 0;
        const retailMargin = purchase > 0 ? ((retail - purchase) / purchase * 100).toFixed(2) : 0;
        const wholesaleToRetailMargin = wholesale > 0 ? ((retail - wholesale) / wholesale * 100).toFixed(2) : 0;

        return { wholesaleMargin, retailMargin, wholesaleToRetailMargin };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            const response = await fetch("http://localhost:8080/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: product.name,
                    purchasePrice: parseFloat(product.purchasePrice),
                    wholesalePrice: parseFloat(product.wholesalePrice),
                    retailPrice: parseFloat(product.retailPrice),
                    quantity: parseInt(product.stock),
                    category: product.category,
                    description: product.description,
                    imageUrl: product.imageUrl
                })
            });

            const result = await response.json();

            if (!response.ok) {
                handleError(result.message || "Failed to add product");
                return;
            }

            setShowSuccess(true);
            handleSuccess("Product Added Successfully!");

            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);

            setProduct({
                name: "",
                purchasePrice: "",
                wholesalePrice: "",
                retailPrice: "",
                stock: "",
                category: "",
                description: "",
                imageUrl: ""
            });

        } catch (error) {
            console.error(error);
            handleError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const margins = calculateMargins();

    // Animation variants
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.3 }
    };

    const inputVariants = {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.2 }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                            className="bg-blue-600 p-2 rounded-xl"
                        >
                            <FiPackage className="text-white text-2xl" />
                        </motion.div>
                        Product Management
                    </h1>
                    <p className="text-gray-600 mt-2 ml-2">Add new products with complete pricing structure</p>
                </motion.div>

                {/* Success Notification */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
                        >
                            <FiCheckCircle className="text-xl" />
                            Product Added Successfully!
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form - 2 columns */}
                    <motion.div
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        className="lg:col-span-2"
                    >
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <motion.div
                                initial={{ x: -100 }}
                                animate={{ x: 0 }}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4"
                            >
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <FiSave className="text-white" />
                                    Add New Product
                                </h2>
                            </motion.div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Product Name */}
                                <motion.div variants={inputVariants}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Product Name *
                                    </label>
                                    <div className="relative">
                                        <FiPackage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Enter product name"
                                            value={product.name}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                                                }`}
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {errors.name && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="mt-1 text-sm text-red-600"
                                            >
                                                {errors.name}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Pricing Section */}
                                <motion.div variants={inputVariants} className="border-t border-gray-200 pt-4">
                                    <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <FiDollarSign className="text-green-600" />
                                        Pricing Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Purchase Price * (Rs)
                                            </label>
                                            <div className="relative">
                                                <FiShoppingBag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="purchasePrice"
                                                    placeholder="0.00"
                                                    value={product.purchasePrice}
                                                    onChange={handleChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.purchasePrice ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                                                        }`}
                                                />
                                            </div>
                                            <AnimatePresence>
                                                {errors.purchasePrice && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="mt-1 text-sm text-red-600"
                                                    >
                                                        {errors.purchasePrice}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                            <p className="mt-1 text-xs text-gray-500">Cost price from supplier</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Wholesale Price * (Rs)
                                            </label>
                                            <div className="relative">
                                                <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="wholesalePrice"
                                                    placeholder="0.00"
                                                    value={product.wholesalePrice}
                                                    onChange={handleChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.wholesalePrice ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                                                        }`}
                                                />
                                            </div>
                                            <AnimatePresence>
                                                {errors.wholesalePrice && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="mt-1 text-sm text-red-600"
                                                    >
                                                        {errors.wholesalePrice}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                            <p className="mt-1 text-xs text-gray-500">Price for bulk/business customers</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Retail Price * (Rs)
                                            </label>
                                            <div className="relative">
                                                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="retailPrice"
                                                    placeholder="0.00"
                                                    value={product.retailPrice}
                                                    onChange={handleChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.retailPrice ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                                                        }`}
                                                />
                                            </div>
                                            <AnimatePresence>
                                                {errors.retailPrice && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="mt-1 text-sm text-red-600"
                                                    >
                                                        {errors.retailPrice}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                            <p className="mt-1 text-xs text-gray-500">Regular selling price</p>
                                        </div>
                                    </div>

                                    {/* Margin Preview */}
                                    <AnimatePresence>
                                        {product.purchasePrice && product.wholesalePrice && product.retailPrice && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl"
                                            >
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    <motion.div
                                                        animate={{ rotate: [0, 360] }}
                                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                                                    >
                                                        <FiTrendingUp className="text-green-600" />
                                                    </motion.div>
                                                    Profit Margin Analysis
                                                </h4>
                                                <div className="grid grid-cols-3 gap-3 text-center">
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        className="bg-white rounded-lg p-2 shadow-sm"
                                                    >
                                                        <p className="text-xs text-gray-500">Wholesale Margin</p>
                                                        <p className={`text-lg font-bold ${margins.wholesaleMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {margins.wholesaleMargin}%
                                                        </p>
                                                        <p className="text-xs text-gray-500">on Purchase</p>
                                                    </motion.div>
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        className="bg-white rounded-lg p-2 shadow-sm"
                                                    >
                                                        <p className="text-xs text-gray-500">Retail Margin</p>
                                                        <p className={`text-lg font-bold ${margins.retailMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {margins.retailMargin}%
                                                        </p>
                                                        <p className="text-xs text-gray-500">on Purchase</p>
                                                    </motion.div>
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        className="bg-white rounded-lg p-2 shadow-sm"
                                                    >
                                                        <p className="text-xs text-gray-500">Wholesale → Retail</p>
                                                        <p className={`text-lg font-bold ${margins.wholesaleToRetailMargin >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                            {margins.wholesaleToRetailMargin}%
                                                        </p>
                                                        <p className="text-xs text-gray-500">markup</p>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Stock and Category */}
                                <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <motion.div variants={inputVariants}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Stock Quantity *
                                        </label>
                                        <div className="relative">
                                            <FiArchive className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                name="stock"
                                                placeholder="0"
                                                value={product.stock}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.stock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                                                    }`}
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {errors.stock && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="mt-1 text-sm text-red-600"
                                                >
                                                    {errors.stock}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    <motion.div variants={inputVariants}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Category *
                                        </label>
                                        <div className="relative">
                                            <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <select
                                                name="category"
                                                value={product.category}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                                                    }`}
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <AnimatePresence>
                                            {errors.category && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="mt-1 text-sm text-red-600"
                                                >
                                                    {errors.category}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </motion.div>

                                {/* Image URL */}
                                <motion.div variants={inputVariants}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Image URL (Optional)
                                    </label>
                                    <div className="relative">
                                        <FiImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="url"
                                            name="imageUrl"
                                            placeholder="https://example.com/image.jpg"
                                            value={product.imageUrl}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </motion.div>

                                {/* Description */}
                                <motion.div variants={inputVariants}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <div className="relative">
                                        <FiList className="absolute left-3 top-3 text-gray-400" />
                                        <textarea
                                            name="description"
                                            placeholder="Detailed product description..."
                                            value={product.description}
                                            onChange={handleChange}
                                            rows="5"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                                                }`}
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {errors.description && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="mt-1 text-sm text-red-600"
                                            >
                                                {errors.description}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {product.description.length} characters
                                    </p>
                                </motion.div>

                                {/* Submit Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center justify-center gap-2"
                                        >
                                            <motion.svg
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="animate-spin h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </motion.svg>
                                            Saving Product...
                                        </motion.span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <FiSave className="text-xl" />
                                            Add Product
                                        </span>
                                    )}
                                </motion.button>
                            </form>
                            <ToastContainer />
                        </div>
                    </motion.div>

                    {/* Preview Panel - 1 column */}
                    <motion.div
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-2xl shadow-xl sticky top-8">
                            <motion.div
                                initial={{ x: 100 }}
                                animate={{ x: 0 }}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-2xl"
                            >
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    >
                                        <FiPackage />
                                    </motion.div>
                                    Live Preview
                                </h3>
                            </motion.div>
                            <div className="p-6">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.2 }}
                                    className="border rounded-xl overflow-hidden shadow-lg"
                                >
                                    {product.imageUrl ? (
                                        <motion.img
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            src={product.imageUrl}
                                            alt={product.name || "Product preview"}
                                            className="w-full h-48 object-cover"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/400x300?text=Invalid+Image+URL";
                                            }}
                                        />
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="w-full h-48 bg-gray-100 flex items-center justify-center"
                                        >
                                            <FiImage className="text-gray-400 text-5xl" />
                                        </motion.div>
                                    )}
                                    <div className="p-4 space-y-3">
                                        <motion.h4
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="font-semibold text-gray-800 text-lg"
                                        >
                                            {product.name || "Product Name"}
                                        </motion.h4>

                                        {/* Pricing Preview */}
                                        <div className="space-y-2">
                                            {product.retailPrice && (
                                                <motion.p
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="text-2xl font-bold text-blue-600"
                                                >
                                                    Rs {parseFloat(product.retailPrice).toFixed(2)}
                                                    <span className="text-sm font-normal text-gray-500 ml-2">(Retail)</span>
                                                </motion.p>
                                            )}
                                            {product.wholesalePrice && (
                                                <p className="text-md text-gray-600">
                                                    Wholesale: Rs {parseFloat(product.wholesalePrice).toFixed(2)}
                                                </p>
                                            )}
                                            {product.purchasePrice && (
                                                <p className="text-sm text-gray-500">
                                                    Purchase: Rs {parseFloat(product.purchasePrice).toFixed(2)}
                                                </p>
                                            )}
                                        </div>

                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-gray-600"
                                        >
                                            {product.description || "Product description will appear here..."}
                                        </motion.p>

                                        {product.category && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                                            >
                                                {product.category}
                                            </motion.span>
                                        )}

                                        {product.stock && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`text-xs mt-2 ${parseInt(product.stock) === 0 ? 'text-red-500' :
                                                    parseInt(product.stock) < 10 ? 'text-orange-500' : 'text-green-500'}`}
                                            >
                                                Stock: {product.stock} units
                                                {parseInt(product.stock) === 0 && " (Out of Stock)"}
                                                {parseInt(product.stock) > 0 && parseInt(product.stock) < 10 && " (Low Stock)"}
                                            </motion.p>
                                        )}

                                        {/* Margin Summary in Preview */}
                                        {product.purchasePrice && product.retailPrice && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-3 pt-3 border-t border-gray-200"
                                            >
                                                <p className="text-xs text-gray-500">
                                                    Profit Margin:
                                                    <span className={`ml-1 font-semibold ${margins.retailMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {margins.retailMargin}%
                                                    </span>
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminAddProduct;