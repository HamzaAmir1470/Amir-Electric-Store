import React from "react";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";

const Login = () => {
    const [role, setRole] = React.useState("user");

    const [loginInfo, setLoginInfo] = React.useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const { email, password } = loginInfo;

        if (!email || !password) {
            return handleError("All fields are required");
        }

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password })
            });

            let data = {};
            try {
                data = await response.json();
            } catch {
                console.log("Invalid JSON response");
            }

            if (!response.ok) {
                return handleError(data?.message || "Login failed");
            }

            const userRole = data?.user?.role;

            // ❗ IMPORTANT CHECK
            if (role === "admin" && userRole !== "admin") {
                return handleError("Access denied! You are not an admin.");
            }

            // ✅ Save token + role
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", userRole);

            handleSuccess("Login successful!");

            // Clear form
            setLoginInfo({
                email: "",
                password: ""
            });

            // Redirect
            setTimeout(() => {
                if (userRole === "admin") {
                    window.location.href = "/admin";
                } else {
                    window.location.href = "/";
                }
            }, 1000);

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
                    <Link to="/">⚡ Amir Electric Store</Link>
                </h2>

                <p className="text-center text-gray-500 mb-6">
                    Login to your account
                </p>

                {/*  ROLE TOGGLE */}
                <div className="flex mb-6 bg-gray-200 rounded-lg p-1">
                    <button
                        onClick={() => setRole("user")}
                        className={`w-1/2 py-2 rounded-lg font-semibold transition ${role === "user"
                            ? "bg-blue-500 text-white"
                            : "text-gray-700"
                            }`}
                    >
                        User Login
                    </button>

                    <button
                        onClick={() => setRole("admin")}
                        className={`w-1/2 py-2 rounded-lg font-semibold transition ${role === "admin"
                            ? "bg-blue-500 text-white"
                            : "text-gray-700"
                            }`}
                    >
                        Admin Login
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={loginInfo.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={loginInfo.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition shadow-lg"
                    >
                        {role === "admin" ? "Login as Admin" : "Login as User"}
                    </button>
                </form>

                <ToastContainer />

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Don’t have an account?{" "}
                    <Link to="/signup" className="text-blue-500 font-medium hover:underline">
                        Sign up
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default Login;