import React from "react";

const ProductCard = ({ item }) => {
    return (
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-xl transition border-t-4 border-blue-500 group">

            {/* Product Image */}
            <div className="overflow-hidden rounded-lg mb-4">
                <img
                    src={item.image}
                    alt={item.name}
                    className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Product Name */}
            <h2 className="text-lg font-semibold mb-1 text-gray-900">
                {item.name}
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-2">
                {item.desc}
            </p>

            {/* Price */}
            <p className="text-blue-600 font-bold mb-4">
                {item.price}
            </p>

            {/* Button */}
            <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;