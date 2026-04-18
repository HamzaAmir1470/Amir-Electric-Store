import React from "react";
import owner from "../assets/owner.jpg"
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <main className="bg-white text-gray-800">

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-black via-gray-900 to-blue-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                        Amir Electric <span className="text-blue-400">Store</span>
                    </h1>

                    <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
                        Powering your home and business with reliable electrical products
                        and expert solutions. Quality you can trust.
                    </p>

                    <div className="flex justify-center gap-4">
                        <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-lg">
                            <Link to="/products">
                                Shop Now
                            </Link>
                        </button>
                        <button className="px-6 py-3 border border-blue-400 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition">
                            <Link to="/products">
                                View Products
                            </Link>
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-12 text-gray-900">
                        Why Choose Amir Electric?
                    </h2>

                    <div className="grid gap-10 md:grid-cols-3">

                        <div className="bg-white p-8 rounded-xl shadow hover:shadow-xl transition border-t-4 border-blue-500">
                            <h3 className="text-xl font-semibold mb-4">⚡ Quality Products</h3>
                            <p className="text-gray-600">
                                We provide durable and certified electrical items for long-lasting performance.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow hover:shadow-xl transition border-t-4 border-blue-500">
                            <h3 className="text-xl font-semibold mb-4">🔌 Wide Range</h3>
                            <p className="text-gray-600">
                                From wiring to appliances, everything you need in one place.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow hover:shadow-xl transition border-t-4 border-blue-500">
                            <h3 className="text-xl font-semibold mb-4">🛠 Trusted Service</h3>
                            <p className="text-gray-600">
                                Expert advice and reliable customer support for all your needs.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Owner Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

                    {/* Image */}
                    <div className="flex flex-col items-center justify-center">
                        <img
                            src={owner}
                            alt="Owner"
                            className="w-72 h-72 object-cover rounded-2xl shadow-xl border-4 border-blue-500"
                        />

                        <h2 className="text-2xl font-bold mt-4 text-gray-900">
                            ɦαɱƶα αɱเ૨
                        </h2>
                    </div>

                    {/* Content */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">
                            Meet the Owner
                        </h2>

                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Amir Electric Store is proudly led by a dedicated professional
                            with years of experience in the electrical industry. Our mission
                            is to provide high-quality products with honest service and
                            customer satisfaction.
                        </p>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            We believe in trust, reliability, and long-term relationships
                            with our customers. Your needs are our priority.
                        </p>

                        <a
                            href="https://wa.me/923054124410"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-lg"
                        >
                            Contact Owner
                        </a>
                    </div>

                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-gradient-to-r from-black to-blue-900 text-white py-16 text-center">
                <h2 className="text-3xl font-bold mb-4">
                    Need Electrical Solutions?
                </h2>
                <p className="mb-6 text-gray-300">
                    Visit Amir Electric Store today and get the best deals on quality products.
                </p>
                <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-lg">
                    <Link to="/contact">
                        Contact Us
                    </Link>
                </button>
            </section>

        </main>
    );
};

export default Home;