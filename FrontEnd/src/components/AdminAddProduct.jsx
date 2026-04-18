import React, { useState } from "react";
import { FiPackage, FiDollarSign, FiTag, FiList, FiSave, FiImage, FiArchive } from "react-icons/fi";

const AdminAddProduct = () => {
    const [product, setProduct] = useState({
        name: "",
        price: "",
        stock: "",
        category: "",
        description: "",
        imageUrl: ""
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        "Electronics",
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
        if (!product.price || product.price <= 0) newErrors.price = "Valid price is required";
        if (!product.stock || product.stock < 0) newErrors.stock = "Valid stock quantity is required";
        if (!product.category) newErrors.category = "Please select a category";
        if (!product.description.trim()) newErrors.description = "Product description is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log("Product Data:", product);
        alert("✅ Product Added Successfully!");

        setProduct({
            name: "",
            price: "",
            stock: "",
            category: "",
            description: "",
            imageUrl: ""
        });

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <FiPackage className="text-white text-2xl" />
                        </div>
                        Product Management
                    </h1>
                    <p className="text-gray-600 mt-2 ml-2">Add new products to your inventory</p>
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

                                {/* Price and Stock - 2 columns */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Price (Rs) *
                                        </label>
                                        <div className="relative">
                                            <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                name="price"
                                                placeholder="0.00"
                                                value={product.price}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                                                    }`}
                                            />
                                        </div>
                                        {errors.price && (
                                            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                        )}
                                    </div>

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
                                </div>

                                {/* Category Dropdown */}
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
                                            Save Product
                                        </span>
                                    )}
                                </button>
                            </form>
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
                                    <div className="p-4 space-y-2">
                                        <h4 className="font-semibold text-gray-800">
                                            {product.name || "Product Name"}
                                        </h4>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {product.price ? `Rs ${product.price}` : "Rs 0"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {product.description || "Product description will appear here..."}
                                        </p>
                                        {product.category && (
                                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                                {product.category}
                                            </span>
                                        )}
                                        {product.stock && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Stock: {product.stock} units
                                            </p>
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