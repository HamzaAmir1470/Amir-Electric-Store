import React from "react";
import { Link } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import { ToastContainer } from "react-toastify";

const AdminSignUp = () => {

    const [loading, setLoading] = React.useState(false);

    const [signupInfo, setSignupInfo] = React.useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin"   // 🔥 FIX: role added in state
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setSignupInfo((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        const { name, email, password, confirmPassword, role } = signupInfo;
        console.log("Signup Info:", signupInfo); // Debug log

        if (!name || !email || !password || !confirmPassword) {
            return handleError("All fields are required");
        }

        if (password !== confirmPassword) {
            return handleError("Passwords do not match");
        }

        try {
            setLoading(true);

            const response = await fetch("http://localhost:8080/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role  
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                return handleError(data?.message || "Sign up failed");
            }

            handleSuccess(data?.message || "Admin created successfully!");

            setSignupInfo({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "admin"
            });

            setTimeout(() => {
                window.location.href = "/admin/login";
            }, 1000);

        } catch (error) {
            handleError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-900 to-blue-900">

            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

                <h2 className="text-3xl font-bold text-center mb-2">
                    <Link to="/">
                        ⚡ ̷A̷̷m̷̷i̷̷r̷ ̷E̷̷l̷̷e̷̷c̷̷t̷̷r̷̷i̷̷c̷ ̷S̷̷t̷̷o̷̷r̷̷e̷
                    </Link>
                </h2>

                <p className="text-center text-gray-500 mb-6">
                    Create your account as Admin
                </p>

                <form onSubmit={handleSignUp} className="space-y-4">

                    <input
                        onChange={handleChange}
                        type="text"
                        name="name"
                        value={signupInfo.name}
                        placeholder="Enter your name"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        onChange={handleChange}
                        type="email"
                        name="email"
                        value={signupInfo.email}
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        onChange={handleChange}
                        type="password"
                        name="password"
                        value={signupInfo.password}
                        placeholder="Create password"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        onChange={handleChange}
                        type="password"
                        name="confirmPassword"
                        value={signupInfo.confirmPassword}
                        placeholder="Confirm password"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* ROLE UI (LOCKED ADMIN) */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked
                            disabled
                            className="w-4 h-4"
                        />
                        <label>Registering as Admin</label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition shadow-lg disabled:opacity-60"
                    >
                        {loading ? "Creating Admin..." : "Sign Up"}
                    </button>
                </form>

                <ToastContainer />

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an admin account?{" "}
                    <Link to="/login" className="text-blue-500 font-medium hover:underline">
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default AdminSignUp;