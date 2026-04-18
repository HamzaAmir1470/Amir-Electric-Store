import React from "react";
import { Link } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from "../utils";

const Login = () => {
    const [loginInfo, setLoginInfo] = React.useState({
        email: "",
        password: ""
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        const copyLoginInfo = { ...loginInfo };
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
    };
    console.log("loginInfo ->", loginInfo);

    const handleLogin = async (e) => {
        e.preventDefault();

        const { email, password } = loginInfo;

        // Validation
        if (!email || !password) {
            return handleError("All fields are required");
        }

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({   email, password }),
            });

            // SAFE JSON PARSE
            let data = {};
            try {
                data = await response.json();
            } catch (err) {
                console.log("Invalid JSON response");
            }

            // HANDLE ERROR RESPONSE
            if (!response.ok) {
                return handleError(data?.message || "Login failed");
            }

            // CLEAR FORM
            setLoginInfo({
                email: "",
                password: ""
            });

            // SUCCESS
            if (response.ok) {
                handleSuccess(data?.message || "Login successful!");
                setTimeout(() => {
                    window.location.href = "/";
                }, 1000);
            }
        } catch (error) {
            console.error("Login Error:", error);
            handleError("Server error. Please try again later.");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-900 to-blue-900">

            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

                {/* Title */}
                <h2 className="text-3xl font-bold text-center mb-2">
                    <Link to="/">⚡ ̷A̷̷m̷̷i̷̷r̷ ̷E̷̷l̷̷e̷̷c̷̷t̷̷r̷̷i̷̷c̷ ̷S̷̷t̷̷o̷̷r̷̷e̷</Link>
                </h2>
                <p className="text-center text-gray-500 mb-6">
                    Login to your account
                </p>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            onChange={handleChange}
                            type="email"
                            name="email"
                            value={loginInfo.email}
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            onChange={handleChange}
                            type="password"
                            name="password"
                            value={loginInfo.password}
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
                <ToastContainer />
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