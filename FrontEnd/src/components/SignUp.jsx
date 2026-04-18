import React from "react";
import { Link, Navigate } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import { ToastContainer } from "react-toastify";
const SignUp = () => {
    const [signupInfo, setSignupInfo] = React.useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        const copySignupInfo = { ...signupInfo };
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    };
    console.log("signupInfo ->", signupInfo);

    const handleSignUp = async (e) => {
        e.preventDefault();

        const { name, email, password, confirmPassword } = signupInfo;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return handleError("All fields are required");
        }

        if (password !== confirmPassword) {
            return handleError("Passwords do not match");
        }

        try {
            const response = await fetch("http://localhost:8080/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
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
                return handleError(data?.message || "Sign up failed");
            }

            // CLEAR FORM
            setSignupInfo({
                name: "",
                email: "",
                password: "",
                confirmPassword: ""
            });

            // SUCCESS
            if (response.ok) {
                handleSuccess(data?.message || "Sign up successful!");
                setTimeout(() => {
                    window.location.href = "/login";
                },1000);
            }
        } catch (error) {
            console.error("Signup Error:", error);
            handleError("Server error. Please try again later.");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-900 to-blue-900">

            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

                {/* Title */}
                <h2 className="text-3xl font-bold text-center mb-2">
                    <Link to="/">
                        ⚡ ̷A̷̷m̷̷i̷̷r̷ ̷E̷̷l̷̷e̷̷c̷̷t̷̷r̷̷i̷̷c̷ ̷S̷̷t̷̷o̷̷r̷̷e̷
                    </Link>
                </h2>
                <p className="text-center text-gray-500 mb-6">
                    Create your account
                </p>

                {/* Form */}
                <form onSubmit={handleSignUp} className="space-y-4">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            onChange={handleChange}
                            type="text"
                            name="name"
                            value={signupInfo.name}
                            placeholder="Enter your name"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            onChange={handleChange}
                            type="email"
                            name="email"
                            value={signupInfo.email}
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
                            value={signupInfo.password}
                            placeholder="Create password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Confirm Password</label>
                        <input
                            onChange={handleChange}
                            type="password"
                            name="confirmPassword"
                            value={signupInfo.confirmPassword}
                            placeholder="Confirm password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition shadow-lg"
                    >
                        Sign Up
                    </button>
                </form>
                <ToastContainer />
                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-500 font-medium hover:underline">
                        Login
                    </a>
                </p>

            </div>
        </div>
    );
};

export default SignUp;