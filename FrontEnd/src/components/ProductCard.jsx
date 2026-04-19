import React, { useState } from "react";
import { FiShoppingCart, FiEye, FiTag, FiTrendingUp } from "react-icons/fi";
import { handleSuccess } from "../utils";

const ProductCard = ({ item }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const getStockColor = () => {
        if (item.stock === 0) return "text-red-600 bg-red-50";
        if (item.stock < 10) return "text-orange-600 bg-orange-50";
        if (item.stock < 50) return "text-yellow-600 bg-yellow-50";
        return "text-green-600 bg-green-50";
    };

    const getStockIcon = () => {
        if (item.stock === 0) return "🔴";
        if (item.stock < 10) return "🟠";
        if (item.stock < 50) return "🟡";
        return "🟢";
    };

    return (
        <div
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Section */}
            <div className="relative h-52 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                {item.image && !imageError ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-2">
                            <FiTag className="text-blue-500 text-2xl" />
                        </div>
                        <span className="text-xs text-gray-400">No Image</span>
                    </div>
                )}

                {/* Stock Badge */}
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${getStockColor()} flex items-center gap-1.5 shadow-sm`}>
                    <span>{getStockIcon()}</span>
                    <span>{item.stockStatus.label}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
                {/* SKU and Category */}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded">
                        {item.sku}
                    </span>
                    {item.category && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            {item.category}
                        </span>
                    )}
                </div>

                {/* Product Name */}
                <h3 className="font-semibold text-gray-800 text-base mb-2 line-clamp-2 min-h-[48px] leading-snug">
                    {item.name}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-xs mb-3 line-clamp-2 min-h-[36px]">
                    {item.desc}
                </p>

                {/* Price Section */}
                <div className="mb-3">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            {formatPrice(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > 0 && item.originalPrice !== item.price && (
                            <span className="text-xs text-gray-400 line-through">
                                {formatPrice(item.originalPrice)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <FiTrendingUp className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-500">{item.priceLabel}</span>
                    </div>
                </div>

                {/* Stock Progress Bar for Low Stock */}
                {item.stock > 0 && item.stock < 50 && (
                    <div className="mb-3">
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${item.stock < 10 ? "bg-red-500" :
                                        item.stock < 30 ? "bg-orange-500" : "bg-yellow-500"
                                    }`}
                                style={{ width: `${Math.min((item.stock / 50) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">
                            Only {item.stock} units left
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;