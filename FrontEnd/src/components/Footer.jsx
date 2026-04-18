import React from "react";

const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-black via-gray-900 to-blue-900 text-gray-300 pt-12 pb-6">

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">

                {/* Brand */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        ⚡ <span className="text-blue-400">AES</span>
                    </h2>
                    <p className="text-sm leading-relaxed">
                        Providing high-quality electrical products and reliable services
                        for homes and businesses. Power you can trust.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-blue-400 transition">Home</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition">Products</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition">About</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Contact</h3>
                    <ul className="space-y-2 text-sm">
                        <li>📍 Lahore, Pakistan</li>
                        <li>📞 +92 305 4124410</li>
                        <li>✉️ mh041829@gmail.com</li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
                    <p className="text-sm mb-4">Get latest offers & updates</p>
                    <div className="flex">
                        <input
                            type="email"
                            placeholder="Enter email"
                            className="w-full px-3 py-2 rounded-l-lg text-black outline-none"
                        />
                        <button className="bg-blue-500 px-4 py-2 rounded-r-lg hover:bg-blue-600 transition">
                            Subscribe
                        </button>
                    </div>
                </div>

            </div>

            {/* Bottom */}
            <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} Amir Electric Store. All rights reserved.
            </div>

        </footer>
    );
};

export default Footer;