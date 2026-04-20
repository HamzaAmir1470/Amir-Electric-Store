import React, { useState, useEffect } from 'react';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiCalendar,
    FiEdit2,
    FiSave,
    FiX,
    FiLock,
    FiShield,
    FiPackage,
    FiFileText,
    FiTrendingUp,
    FiTrendingDown,
    FiCheckCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiCamera,
    FiLogOut,
    FiShoppingBag,
    FiHeart,
    FiSettings
} from 'react-icons/fi';
import { handleSuccess, handleError } from '../utils';

const Profile = () => {
    const [user, setUser] = useState({
        id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        role: 'user',
        joinDate: '',
        avatar: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        wishlistCount: 0,
        activeOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});

    const API_URL = "http://localhost:8080";

    useEffect(() => {
        fetchUserProfile();
        fetchUserStats();
        fetchRecentOrders();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            console.log("Token being sent:", token);
            // Fetch fresh user data from backend
            const response = await fetch(`${API_URL}/auth/getProfile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Fetched profile data:", result);
                setUser(result.user);
                setEditForm(result.user);
            } else {
                setUser({
                    ...userData,
                    joinDate: new Date().toISOString(),
                    address: userData.address || '',
                    phone: userData.phone || ''
                });
                setEditForm({
                    ...userData,
                    joinDate: new Date().toISOString(),
                    address: userData.address || '',
                    phone: userData.phone || ''
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            handleError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        setStats({
            totalOrders: 24,
            totalSpent: 125000,
            wishlistCount: 8,
            activeOrders: 3
        });
    };

    const fetchRecentOrders = async () => {
        setRecentOrders([
            {
                id: 'ORD-001',
                date: '2024-01-15',
                total: 12500,
                status: 'delivered',
                items: 3
            },
            {
                id: 'ORD-002',
                date: '2024-01-20',
                total: 8500,
                status: 'shipped',
                items: 2
            },
            {
                id: 'ORD-003',
                date: '2024-01-25',
                total: 3200,
                status: 'processing',
                items: 1
            }
        ]);
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
            const response = await fetch(`${API_URL}/auth/getProfile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editForm.name,
                    phone: editForm.phone,
                    address: editForm.address
                })
            });

            if (response.ok) {
                const result = await response.json();
                setUser(result.user);
                // Update localStorage
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...storedUser,
                    name: editForm.name,
                    phone: editForm.phone,
                    address: editForm.address
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
        // Validation
        const errors = {};
        if (!passwordData.currentPassword) errors.currentPassword = "Current password required";
        if (!passwordData.newPassword) errors.newPassword = "New password required";
        if (passwordData.newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters";
        if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = "Passwords do not match";

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/change-password`, {
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'text-green-600 bg-green-50';
            case 'shipped': return 'text-blue-600 bg-blue-50';
            case 'processing': return 'text-orange-600 bg-orange-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <FiCheckCircle className="text-green-600" />;
            case 'shipped': return <FiPackage className="text-blue-600" />;
            case 'processing': return <FiRefreshCw className="text-orange-600" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <FiUser className="text-white text-2xl" />
                        </div>
                        My Profile
                    </h1>
                    <p className="text-gray-600 mt-2 ml-2">Manage your account information and preferences</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
                                <div className="relative inline-block">
                                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-28 h-28 rounded-full object-cover" />
                                        ) : (
                                            <div className="text-5xl text-blue-600 font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition">
                                        <FiCamera className="text-gray-600 text-sm" />
                                    </button>
                                </div>
                                <h2 className="text-white text-xl font-semibold mt-4">{user.name}</h2>
                                <p className="text-blue-100 text-sm mt-1 capitalize">{user.role}</p>
                                {user.role === 'admin' && (
                                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-white/20 rounded-full text-xs text-white">
                                        <FiShield className="text-xs" />
                                        Admin Access
                                    </span>
                                )}
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FiMail className="text-gray-400 text-lg" />
                                    <div>
                                        <p className="text-xs text-gray-400">Email Address</p>
                                        <p className="text-sm font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FiPhone className="text-gray-400 text-lg" />
                                    <div>
                                        <p className="text-xs text-gray-400">Phone Number</p>
                                        <p className="text-sm font-medium">{user.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FiMapPin className="text-gray-400 text-lg" />
                                    <div>
                                        <p className="text-xs text-gray-400">Address</p>
                                        <p className="text-sm font-medium">{user.address || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FiCalendar className="text-gray-400 text-lg" />
                                    <div>
                                        <p className="text-xs text-gray-400">Member Since</p>
                                        <p className="text-sm font-medium">{formatDate(user.joinDate || new Date())}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 pt-0 space-y-3">
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                                >
                                    <FiLock />
                                    Change Password
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FiTrendingUp className="text-blue-600" />
                                Shopping Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Orders</span>
                                    <span className="font-semibold text-gray-800">{stats.totalOrders}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Spent</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(stats.totalSpent)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Active Orders</span>
                                    <span className="font-semibold text-orange-600">{stats.activeOrders}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Wishlist Items</span>
                                    <span className="font-semibold text-blue-600">{stats.wishlistCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Edit Form & Orders */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Edit Profile Section */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <FiEdit2 className="text-blue-600" />
                                    {isEditing ? "Edit Profile" : "Profile Information"}
                                </h3>
                                {!isEditing ? (
                                    <button
                                        onClick={handleEdit}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm"
                                    >
                                        <FiEdit2 />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSave}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm"
                                        >
                                            <FiSave />
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition text-sm"
                                        >
                                            <FiX />
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={editForm.phone || ''}
                                                onChange={handleChange}
                                                placeholder="+92 XXX XXXXXXX"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Address
                                            </label>
                                            <textarea
                                                name="address"
                                                value={editForm.address || ''}
                                                onChange={handleChange}
                                                rows="3"
                                                placeholder="Your complete address"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <FiUser className="text-blue-600 text-xl" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400">Full Name</p>
                                                <p className="font-medium text-gray-800">{user.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <FiMail className="text-green-600 text-xl" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400">Email Address</p>
                                                <p className="font-medium text-gray-800">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                                <FiPhone className="text-orange-600 text-xl" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400">Phone Number</p>
                                                <p className="font-medium text-gray-800">{user.phone || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                <FiMapPin className="text-purple-600 text-xl" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400">Address</p>
                                                <p className="font-medium text-gray-800">{user.address || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <FiShoppingBag className="text-blue-600" />
                                    Recent Orders
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                {recentOrders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FiPackage className="text-gray-300 text-5xl mx-auto mb-3" />
                                        <p className="text-gray-500">No orders yet</p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Items
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {recentOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900">
                                                        {order.id}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {formatDate(order.date)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {order.items} items
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                        {formatCurrency(order.total)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                            {getStatusIcon(order.status)}
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition group">
                                <FiHeart className="text-red-500 text-lg" />
                                <span className="text-gray-700">Wishlist</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition group">
                                <FiSettings className="text-gray-500 text-lg" />
                                <span className="text-gray-700">Settings</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FiLock className="text-blue-600" />
                                Change Password
                            </h3>
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
                                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                        }`}
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
                                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                                        }`}
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
                                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {passwordErrors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 pt-0">
                            <button
                                onClick={handlePasswordChange}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
                            >
                                Update Password
                            </button>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Profile;