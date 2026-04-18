import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-900 to-blue-900">

            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

                {/* Title */}
                <h2 className="text-3xl font-bold text-center mb-2">
                    <Link to="/">⚡ Amir Electric Store</Link>
                </h2>
                <p className="text-center text-gray-500 mb-6">
                    Login to your account
                </p>

                {/* Form */}
                <form className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Options */}
                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" />
                            Remember me
                        </label>
                        <a href="#" className="text-blue-500 hover:underline">
                            Forgot password?
                        </a>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition shadow-lg"
                    >
                        Login
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Don’t have an account?{" "}
                    <a href="/signup" className="text-blue-500 font-medium hover:underline">
                        Sign up
                    </a>
                </p>

            </div>
        </div>
    );
};

export default Login;