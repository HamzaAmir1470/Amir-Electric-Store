import React from "react";
import { NavLink, Link } from "react-router-dom";

const Header = () => {
    const navStyle = ({ isActive }) =>
        isActive
            ? "text-blue-400 border-b-2 border-blue-400 pb-1"
            : "text-white hover:text-blue-400 transition";

    return (
        <header className="bg-gradient-to-r from-black via-gray-900 to-blue-900 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <div className="text-2xl font-extrabold tracking-wide cursor-pointer flex items-center gap-2">
                    ⚡ <span className="text-blue-400">AES</span>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex space-x-8 text-lg font-medium">

                    <NavLink to="/" className={navStyle}>
                        Home
                    </NavLink>

                    <NavLink to="/products" className={navStyle}>
                        Products
                    </NavLink>

                    <NavLink to="/about" className={navStyle}>
                        About
                    </NavLink>

                    <NavLink to="/contact" className={navStyle}>
                        Contact
                    </NavLink>

                </nav>

                {/* Buttons */}
                <div className="flex items-center space-x-4">

                    <Link
                        to="/login"
                        className="hidden md:block px-4 py-2 rounded-lg border border-blue-400 text-blue-400 hover:bg-blue-500 hover:text-white transition"
                    >
                        Login
                    </Link>

                    <button className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition shadow-lg">
                        Get Started
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;