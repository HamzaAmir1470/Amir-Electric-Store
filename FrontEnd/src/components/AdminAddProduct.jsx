import React, { useState } from "react";
import { FiPackage, FiDollarSign, FiTag, FiList, FiSave, FiImage, FiArchive, FiTrendingUp, FiShoppingBag } from "react-icons/fi";
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

        // Clear error for this field when user starts typing
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

        // Price logic validation
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

            console.log("Saved Product:", result);
            handleSuccess(" Product Added Successfully!");

            // Reset form
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <FiPackage className="text-white text-2xl" />
                        </div>
                        Product Management
                    </h1>
                    <p className="text-gray-600 mt-2 ml-2">Add new products with complete pricing structure</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form - 2 columns */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <FiSave className="text-white" />
                                    Add New Product
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Product Name */}
                                <div>
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
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Pricing Section */}
                                <div className="border-t border-gray-200 pt-4">
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
                                            {errors.purchasePrice && (
                                                <p className="mt-1 text-sm text-red-600">{errors.purchasePrice}</p>
                                            )}
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
                                            {errors.wholesalePrice && (
                                                <p className="mt-1 text-sm text-red-600">{errors.wholesalePrice}</p>
                                            )}
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
                                            {errors.retailPrice && (
                                                <p className="mt-1 text-sm text-red-600">{errors.retailPrice}</p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">Regular selling price</p>
                                        </div>
                                    </div>

                                    {/* Margin Preview */}
                                    {product.purchasePrice && product.wholesalePrice && product.retailPrice && (
                                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <FiTrendingUp className="text-green-600" />
                                                Profit Margin Analysis
                                            </h4>
                                            <div className="grid grid-cols-3 gap-3 text-center">
                                                <div className="bg-white rounded-lg p-2">
                                                    <p className="text-xs text-gray-500">Wholesale Margin</p>
                                                    <p className={`text-lg font-bold ${margins.wholesaleMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {margins.wholesaleMargin}%
                                                    </p>
                                                    <p className="text-xs text-gray-500">on Purchase</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-2">
                                                    <p className="text-xs text-gray-500">Retail Margin</p>
                                                    <p className={`text-lg font-bold ${margins.retailMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {margins.retailMargin}%
                                                    </p>
                                                    <p className="text-xs text-gray-500">on Purchase</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-2">
                                                    <p className="text-xs text-gray-500">Wholesale → Retail</p>
                                                    <p className={`text-lg font-bold ${margins.wholesaleToRetailMargin >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                        {margins.wholesaleToRetailMargin}%
                                                    </p>
                                                    <p className="text-xs text-gray-500">markup</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Stock and Category */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
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
                                        {errors.stock && (
                                            <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                                        )}
                                    </div>

                                    <div>
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
                                        {errors.category && (
                                            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Image URL */}
                                <div>
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
                                </div>

                                {/* Description */}
                                <div>
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
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        {product.description.length} characters
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving Product...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <FiSave className="text-xl" />
                                            Add Product
                                        </span>
                                    )}
                                </button>
                            </form>
                            <ToastContainer />
                        </div>
                    </div>

                    {/* Preview Panel - 1 column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl sticky top-8">
                            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-2xl">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <FiPackage />
                                    Live Preview
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="border rounded-xl overflow-hidden">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name || "Product preview"}
                                            className="w-full h-48 object-cover"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/400x300?text=Invalid+Image+URL";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                            <FiImage className="text-gray-400 text-5xl" />
                                        </div>
                                    )}
                                    <div className="p-4 space-y-3">
                                        <h4 className="font-semibold text-gray-800 text-lg">
                                            {product.name || "Product Name"}
                                        </h4>

                                        {/* Pricing Preview */}
                                        <div className="space-y-2">
                                            {product.retailPrice && (
                                                <p className="text-2xl font-bold text-blue-600">
                                                    Rs {parseFloat(product.retailPrice).toFixed(2)}
                                                    <span className="text-sm font-normal text-gray-500 ml-2">(Retail)</span>
                                                </p>
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

                                        <p className="text-sm text-gray-600">
                                            {product.description || "Product description will appear here..."}
                                        </p>

                                        {product.category && (
                                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                                {product.category}
                                            </span>
                                        )}

                                        {product.stock && (
                                            <p className={`text-xs mt-2 ${parseInt(product.stock) === 0 ? 'text-red-500' :
                                                parseInt(product.stock) < 10 ? 'text-orange-500' : 'text-green-500'}`}>
                                                Stock: {product.stock} units
                                                {parseInt(product.stock) === 0 && " (Out of Stock)"}
                                                {parseInt(product.stock) > 0 && parseInt(product.stock) < 10 && " (Low Stock)"}
                                            </p>
                                        )}

                                        {/* Margin Summary in Preview */}
                                        {product.purchasePrice && product.retailPrice && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <p className="text-xs text-gray-500">
                                                    Profit Margin:
                                                    <span className={`ml-1 font-semibold ${margins.retailMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {margins.retailMargin}%
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAddProduct;