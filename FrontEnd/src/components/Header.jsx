import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem("token");
    const role = localStorage.getItem("role"); // get role

    const navStyle = ({ isActive }) =>
        isActive
            ? "text-blue-400 border-b-2 border-blue-400 pb-1"
            : "text-white hover:text-blue-400 transition";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    };

    return (
        <header className="bg-gradient-to-r from-black via-gray-900 to-blue-900 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <div className="text-2xl font-extrabold tracking-wide cursor-pointer flex items-center gap-2">
                    <Link to="/">
                        ⚡ <span className="text-blue-400">АЄ$</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex space-x-8 text-lg font-medium">
                    <NavLink to="/" className={navStyle}>Home</NavLink>
                    <NavLink to="/products" className={navStyle}>Products</NavLink>
                    <NavLink to="/about" className={navStyle}>About</NavLink>
                    <NavLink to="/contact" className={navStyle}>Contact</NavLink>
                </nav>

                {/* Auth Buttons */}
                <div className="flex items-center space-x-4">

                    {/* Admin Button */}
                    {role === "admin" && (
                        <Link
                            to="/admin/dashboard"
                            className="px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition shadow-lg"
                        >
                            Admin Panel
                        </Link>
                    )}

                    {isLoggedIn && role !== "admin" ? (
                        <div className="flex items-center gap-3">

                            {/* Profile Section */}
                            <Link to="/profile">                            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg shadow-md">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                                    {localStorage.getItem("name")?.charAt(0).toUpperCase() || "U"}
                                </div>

                                <span className="hidden md:block text-sm font-medium">
                                    {localStorage.getItem("name") || "User"}
                                </span>
                            </div>
                            </Link>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition shadow-lg"
                            >
                                Logout
                            </button>
                        </div>
                    ) : isLoggedIn && role === "admin" ? (
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition shadow-lg"
                        >
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="hidden md:block px-4 py-2 rounded-lg border border-blue-400 text-blue-400 hover:bg-blue-500 hover:text-white transition"
                            >
                                Login
                            </Link>

                            <Link
                                to="/signup"
                                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition shadow-lg"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;