import React, { useState, useEffect , useRef} from 'react';
import {
    FiUser,
    FiMail,
    FiEdit2,
    FiSave,
    FiX,
    FiLock,
    FiCamera
} from 'react-icons/fi';
import { handleSuccess, handleError } from '../utils';
import { ToastContainer } from 'react-toastify';


const Profile = () => {
    const [user, setUser] = useState({
        id: '',
        name: '',
        email: '',
        role: 'user',
        joinDate: '',
        avatar: ''
    });
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});

    const API_URL = "http://localhost:8080";

    const hasFetched = React.useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/auth/getProfile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch profile");
            }

            const result = await response.json();

            setUser(result.user);
            setEditForm(result.user);

        } catch (error) {
            console.error("Error fetching profile:", error);
            handleError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditForm({ ...user });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({ ...user });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editForm.name
                })
            });

            if (response.ok) {
                const result = await response.json();
                setUser(result.user);
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...storedUser,
                    name: editForm.name
                }));
                setIsEditing(false);
                handleSuccess("Profile updated successfully!");
            } else {
                handleError("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            handleError("Failed to update profile");
        }
    };

    const handleChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = async () => {
        const errors = {};
        if (!passwordData.currentPassword) errors.currentPassword = "Current password required";
        if (!passwordData.newPassword) errors.newPassword = "New password required";
        if (passwordData.newPassword.length < 5) errors.newPassword = "Password must be at least 5 characters";
        if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = "Passwords do not match";

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/changePassword`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (response.ok) {
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordErrors({});
                handleSuccess("Password changed successfully!");
            } else {
                const result = await response.json();
                handleError(result.message || "Failed to change password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            handleError("Failed to change password");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading profile...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your account information</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
                                ) : (
                                    <div className="text-4xl text-blue-600 font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50 transition">
                                <FiCamera className="text-gray-600 text-sm" />
                            </button>
                        </div>
                        <h2 className="text-white text-xl font-semibold mt-3">{user.name}</h2>
                        <p className="text-blue-100 text-sm mt-1 capitalize">{user.role}</p>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6">
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mb-6">
                            {!isEditing ? (
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <FiEdit2 />
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                    >
                                        <FiSave />
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        <FiX />
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Profile Information */}
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editForm.name || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                    <FiUser className="text-blue-600 text-xl mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Full Name</p>
                                        <p className="font-medium text-gray-800">{user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                    <FiMail className="text-green-600 text-xl mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Email Address</p>
                                        <p className="font-medium text-gray-800">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                    <FiLock className="text-red-600 text-xl mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Password</p>
                                        <button
                                            onClick={() => setShowPasswordModal(true)}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Member Since</p>
                                        <p className="font-medium text-gray-800">{formatDate(user.createdAt || new Date())}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {passwordErrors.currentPassword && (
                                    <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {passwordErrors.newPassword && (
                                    <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {passwordErrors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 pt-0">
                            <button
                                onClick={handlePasswordChange}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Update Password
                            </button>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default Profile;