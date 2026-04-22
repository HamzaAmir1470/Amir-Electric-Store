import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import { FiSearch, FiFilter, FiRefreshCw, FiAlertCircle, FiPackage, FiShield } from "react-icons/fi";
import { handleError } from "../utils";

const Product = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [categories, setCategories] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [showWholesale, setShowWholesale] = useState(false);

    const API_URL = "http://localhost:8080";

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const role = user.role || "user";
        setUserRole(role);
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/products`);
            const result = await response.json();

            if (response.ok) {
                const formattedProducts = result.data.map((product) => ({
                    id: product._id,
                    name: product.name,
                    purchasePrice: product.purchasePrice || 0,
                    wholesalePrice: product.wholesalePrice || product.price || 0,
                    retailPrice: product.retailPrice || product.price || 0,
                    stock: product.quantity || 0,
                    category: product.category || "Uncategorized",
                    description: product.description || "No description available",
                    imageUrl: product.imageUrl || "",
                    sku: product._id.slice(-6).toUpperCase()
                }));
                setProducts(formattedProducts);
                const uniqueCategories = [...new Set(formattedProducts.map(p => p.category))];
                setCategories(uniqueCategories);
            } else {
                handleError(result.message || "Failed to fetch products");
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            handleError("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (selectedCategory !== "all") {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }
        setFilteredProducts(filtered);
    };

    useEffect(() => {
        filterProducts();
    }, [searchTerm, selectedCategory, products]);

    const getDisplayPrice = (product) => {
        if (userRole === "admin" && showWholesale) {
            return product.wholesalePrice;
        }
        return product.retailPrice;
    };

    const getPriceLabel = (product) => {
        if (userRole === "admin" && showWholesale) {
            return "Wholesale Price";
        }
        return "Retail Price";
    };

    const getOriginalPrice = (product) => {
        if (userRole === "admin" && showWholesale) {
            return product.retailPrice;
        }
        return null;
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: "Out of Stock", color: "red", bgColor: "bg-red-100", textColor: "text-red-700", icon: "🔴" };
        if (stock < 10) return { label: "Limited Stock", color: "orange", bgColor: "bg-orange-100", textColor: "text-orange-700", icon: "🟠" };
        if (stock < 50) return { label: "In Stock", color: "yellow", bgColor: "bg-yellow-100", textColor: "text-yellow-700", icon: "🟡" };
        return { label: "Well Stocked", color: "green", bgColor: "bg-green-100", textColor: "text-green-700", icon: "🟢" };
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
                staggerChildren: 0.1,
                delayChildren: 0.2
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
            y: -8,
            transition: { duration: 0.2 }
        }
    };

    const headerVariants = {
        hidden: { opacity: 0, y: -30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <>
            <Header />

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen py-12"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Hero Section */}
                    <motion.div
                        variants={headerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center mb-12"
                    >
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4"
                        >
                            <FiPackage className="text-white text-3xl" />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-slate-800 mb-3">
                            Premium <motion.span
                                animate={{
                                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                }}
                                transition={{ duration: 5, repeat: Infinity }}
                                className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent bg-[length:200%_auto]"
                            >
                                Electrical Products
                            </motion.span>
                        </h1>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            Discover our curated collection of high-quality electrical components for your projects
                        </p>
                    </motion.div>

                    {/* Admin Wholesale Toggle */}
                    <AnimatePresence>
                        {userRole === "admin" && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="mb-6"
                            >
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                whileHover={{ rotate: 15 }}
                                                className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"
                                            >
                                                <FiShield className="text-amber-600 text-xl" />
                                            </motion.div>
                                            <div>
                                                <p className="font-semibold text-amber-800">Admin Mode</p>
                                                <p className="text-xs text-amber-600">You have access to wholesale pricing</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowWholesale(!showWholesale)}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${showWholesale ? "bg-amber-600" : "bg-gray-300"
                                                }`}
                                        >
                                            <motion.span
                                                animate={{ x: showWholesale ? 28 : 4 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                className="inline-block h-6 w-6 transform rounded-full bg-white transition-shadow duration-300 shadow-md"
                                            />
                                        </motion.button>
                                        <motion.span
                                            animate={{ color: showWholesale ? "#b45309" : "#6b7280" }}
                                            className={`text-sm font-medium`}
                                        >
                                            {showWholesale ? "Wholesale Prices Active" : "Retail Prices Active"}
                                        </motion.span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Search and Filter Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-4 mb-8"
                    >
                        <div className="flex flex-wrap gap-3 items-center">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex-1 min-w-[200px] relative"
                            >
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                />
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="relative"
                            >
                                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-gray-50 cursor-pointer"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </motion.div>
                            <motion.button
                                whileHover={{ scale: 1.05, rotate: 180 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchProducts}
                                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition flex items-center gap-2"
                                disabled={loading}
                            >
                                <FiRefreshCw className={`${loading ? "animate-spin" : ""} text-lg`} />
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Results Count */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-6 flex justify-between items-center"
                    >
                        <p className="text-slate-500 text-sm">
                            Showing <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.3 }}
                                key={filteredProducts.length}
                                className="inline-block font-semibold text-slate-700"
                            >
                                {filteredProducts.length}
                            </motion.span> of{" "}
                            <span className="font-semibold text-slate-700">{products.length}</span> products
                        </p>
                    </motion.div>

                    {/* Product Grid */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex justify-center items-center py-20"
                            >
                                <div className="text-center">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="inline-block rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"
                                    />
                                    <p className="text-slate-500 mt-4">Loading amazing products...</p>
                                </div>
                            </motion.div>
                        ) : filteredProducts.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="text-center py-20 bg-white rounded-2xl shadow-sm"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <FiAlertCircle className="text-gray-400 text-3xl" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-slate-700 mb-2">No products found</h3>
                                <p className="text-slate-400">
                                    {searchTerm || selectedCategory !== "all"
                                        ? "Try adjusting your search criteria"
                                        : "Check back later for new arrivals"}
                                </p>
                                {(searchTerm || selectedCategory !== "all") && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedCategory("all");
                                        }}
                                        className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm"
                                    >
                                        Clear Filters
                                    </motion.button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="products"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            >
                                <AnimatePresence>
                                    {filteredProducts.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            variants={cardVariants}
                                            whileHover="hover"
                                            custom={index}
                                        >
                                            <ProductCard
                                                item={{
                                                    id: product.id,
                                                    name: product.name,
                                                    price: getDisplayPrice(product),
                                                    priceLabel: getPriceLabel(product),
                                                    originalPrice: getOriginalPrice(product),
                                                    desc: product.description,
                                                    image: product.imageUrl,
                                                    stock: product.stock,
                                                    stockStatus: getStockStatus(product.stock),
                                                    sku: product.sku,
                                                    category: product.category,
                                                    userRole: userRole,
                                                    showWholesale: showWholesale
                                                }}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.main>

            <Footer />
        </>
    );
};

export default Product;