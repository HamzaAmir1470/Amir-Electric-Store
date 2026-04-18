import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Contact = () => {
    return (
        <>
            <Header />
            <main className="bg-gray-50 min-h-screen py-16">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Contact <span className="text-blue-500">Us</span>
                    </h1>
                    <p className="text-gray-600 mt-2">
                        We’re here to help you with all electrical solutions
                    </p>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10">

                    {/* Contact Info */}
                    <div className="bg-white p-8 rounded-xl shadow border-t-4 border-blue-500">
                        <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>

                        <div className="space-y-4 text-gray-700">
                            <p>📍 <strong>Address:</strong> Kasur, Punjab, Pakistan</p>
                            <p>📞 <strong>Phone:</strong> +92 305 4124410</p>
                            <p>✉️ <strong>Email:</strong> mh041829@gmail.com</p>
                            <p>⏰ <strong>Hours:</strong> Mon - Sat (9:00 AM - 9:00 PM)</p>
                        </div>

                        {/* WhatsApp Button */}
                        <a
                            href="https://wa.me/923054124410"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-6 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition shadow-lg"
                        >
                            💬 Chat on WhatsApp
                        </a>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-xl shadow">

                        <h2 className="text-2xl font-semibold mb-6">Send Message</h2>

                        <form className="space-y-4">

                            <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />

                            <input
                                type="email"
                                placeholder="Your Email"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />

                            <textarea
                                rows="5"
                                placeholder="Your Message"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            ></textarea>

                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition shadow-lg"
                            >
                                Send Message
                            </button>

                        </form>

                    </div>

                </div>
            </main>
            <Footer />
        </>
    );
};

export default Contact;