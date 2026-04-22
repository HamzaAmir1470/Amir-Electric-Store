import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    FiPackage,
    FiBox,
    FiDollarSign,
    FiFileText,
    FiUsers,
    FiRefreshCw,
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
    FiTrendingUp,
    FiShoppingCart,
    FiAward
} from "react-icons/fi";
import { handleError } from "../utils";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        stock: 0,
        sales: 0,
        invoices: 0,
        lowStock: 0,
        outOfStock: 0,
        totalCustomers: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);

    const API_URL = "http://localhost:8080";

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [productsRes, invoicesRes, khatasRes] = await Promise.all([
                fetch(`${API_URL}/products`),
                fetch(`${API_URL}/invoices`),
                fetch(`${API_URL}/khata`).catch(() => ({ ok: false }))
            ]);

            let productsData = [];
            if (productsRes.ok) {
                const productsResult = await productsRes.json();
                productsData = productsResult.data || [];

                const totalProducts = productsData.length;
                const totalStock = productsData.reduce((sum, p) => sum + (p.quantity || 0), 0);
                const lowStock = productsData.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) < 10).length;
                const outOfStock = productsData.filter(p => (p.quantity || 0) === 0).length;

                const lowStockItems = productsData
                    .filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) < 10)
                    .slice(0, 5);
                setLowStockProducts(lowStockItems);

                setStats(prev => ({
                    ...prev,
                    products: totalProducts,
                    stock: totalStock,
                    lowStock: lowStock,
                    outOfStock: outOfStock
                }));
            }

            let invoicesData = [];
            let totalSales = 0;
            if (invoicesRes.ok) {
                const invoicesResult = await invoicesRes.json();
                invoicesData = invoicesResult.data || [];
                totalSales = invoicesData.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

                const recent = invoicesData
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);
                setRecentInvoices(recent);

                setStats(prev => ({
                    ...prev,
                    invoices: invoicesData.length,
                    sales: totalSales
                }));
            }

            if (khatasRes.ok) {
                const khatasResult = await khatasRes.json();
                const khatasData = khatasResult.data || [];
                setStats(prev => ({
                    ...prev,
                    totalCustomers: khatasData.length
                }));
            }

            generateRecentActivities(productsData, invoicesData);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            handleError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const generateRecentActivities = (products, invoices) => {
        const activities = [];

        const recentProducts = products
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
        recentProducts.forEach(product => {
            activities.push({
                id: `product-${product._id}`,
                message: ` New product added: ${product.name}`,
                time: new Date(product.createdAt),
                type: "product"
            });
        });

        const recentInvoicesList = invoices
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
        recentInvoicesList.forEach(invoice => {
            activities.push({
                id: `invoice-${invoice._id}`,
                message: `Invoice ${invoice.invoiceNumber} created - Rs. ${invoice.grandTotal.toFixed(2)}`,
                time: new Date(invoice.createdAt),
                type: "invoice"
            });
        });

        activities.sort((a, b) => b.time - a.time);
        setRecentActivities(activities.slice(0, 5));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInSeconds < 60) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
    };

    const StatCard = ({ title, value, icon, bgColor, iconColor, borderColor }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`${bgColor} rounded-lg p-3 border ${borderColor} shadow-sm hover:shadow transition-all`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-xs font-medium">{title}</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
                </div>
                <div className={`${iconColor} text-2xl`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-3 border-blue-400 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-5">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                            <p className="text-gray-500 text-xs mt-0.5">Welcome back! Here's your business overview</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05, rotate: 180 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={fetchDashboardData}
                            className="p-2 bg-white rounded-lg shadow-sm hover:shadow text-gray-600 transition-all"
                        >
                            <FiRefreshCw size={16} />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats Grid - Row 1 - Small Light Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <StatCard 
                        title="Products" 
                        value={stats.products} 
                        icon={<FiPackage />} 
                        bgColor="bg-blue-50"
                        iconColor="text-blue-500"
                        borderColor="border-blue-100"
                    />
                    <StatCard 
                        title="Stock" 
                        value={stats.stock} 
                        icon={<FiBox />} 
                        bgColor="bg-green-50"
                        iconColor="text-green-500"
                        borderColor="border-green-100"
                    />
                    <StatCard 
                        title="Sales" 
                        value={formatCurrency(stats.sales)} 
                        icon={<FiDollarSign />} 
                        bgColor="bg-purple-50"
                        iconColor="text-purple-500"
                        borderColor="border-purple-100"
                    />
                    <StatCard 
                        title="Invoices" 
                        value={stats.invoices} 
                        icon={<FiFileText />} 
                        bgColor="bg-orange-50"
                        iconColor="text-orange-500"
                        borderColor="border-orange-100"
                    />
                </div>

                {/* Stats Grid - Row 2 - Small Light Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <StatCard 
                        title="Low Stock" 
                        value={stats.lowStock} 
                        icon={<FiAlertCircle />} 
                        bgColor="bg-yellow-50"
                        iconColor="text-yellow-600"
                        borderColor="border-yellow-100"
                    />
                    <StatCard 
                        title="Out of Stock" 
                        value={stats.outOfStock} 
                        icon={<FiAlertCircle />} 
                        bgColor="bg-red-50"
                        iconColor="text-red-500"
                        borderColor="border-red-100"
                    />
                    <StatCard 
                        title="Customers" 
                        value={stats.totalCustomers} 
                        icon={<FiUsers />} 
                        bgColor="bg-indigo-50"
                        iconColor="text-indigo-500"
                        borderColor="border-indigo-100"
                    />
                </div>

                {/* Middle Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                        <div className="bg-blue-500 px-4 py-2.5">
                            <h3 className="text-white font-medium flex items-center gap-2 text-sm">
                                <FiClock size={16} />
                                Recent Activity
                            </h3>
                        </div>
                        <div className="p-3 max-h-80 overflow-y-auto">
                            {recentActivities.length === 0 ? (
                                <p className="text-gray-400 text-center py-6 text-sm">No recent activity</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentActivities.map((activity, idx) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded transition-all"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                                            <div className="flex-1">
                                                <p className="text-gray-700 text-xs">{activity.message}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{getTimeAgo(activity.time)}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Low Stock Alerts */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                        <div className="bg-red-500 px-4 py-2.5">
                            <h3 className="text-white font-medium flex items-center gap-2 text-sm">
                                <FiAlertCircle size={16} />
                                Low Stock Alerts
                            </h3>
                        </div>
                        <div className="p-3 max-h-80 overflow-y-auto">
                            {lowStockProducts.length === 0 ? (
                                <div className="text-center py-6">
                                    <FiCheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                                    <p className="text-gray-500 text-xs">All products have sufficient stock!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {lowStockProducts.map((product, idx) => (
                                        <motion.div
                                            key={product._id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ scale: 1.01 }}
                                            className="flex items-center justify-between p-2 bg-yellow-50 rounded border-l-3 border-yellow-400"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Stock: {product.quantity} units</p>
                                            </div>
                                            <div className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium">
                                                LOW
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Recent Invoices */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                    <div className="bg-purple-500 px-4 py-2.5">
                        <h3 className="text-white font-medium flex items-center gap-2 text-sm">
                            <FiFileText size={16} />
                            Recent Invoices
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        {recentInvoices.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400 text-sm">No invoices generated yet</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Invoice #</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Customer</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Date</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">Amount</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentInvoices.map((invoice, idx) => (
                                        <motion.tr
                                            key={invoice._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            whileHover={{ backgroundColor: '#F9FAFB' }}
                                            className="cursor-pointer"
                                        >
                                            <td className="px-4 py-2 font-mono text-xs font-semibold text-gray-900">
                                                {invoice.invoiceNumber}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="text-xs font-medium text-gray-900">{invoice.customer.name}</div>
                                                {invoice.customer.phone && (
                                                    <div className="text-xs text-gray-500">{invoice.customer.phone}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-xs text-gray-500">
                                                {new Date(invoice.createdAt).toLocaleDateString('en-PK', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-4 py-2 text-right font-semibold text-gray-900 text-xs">
                                                {formatCurrency(invoice.grandTotal)}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                                    <FiCheckCircle size={10} />
                                                    Paid
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>

                {/* Quick Stats Footer - Light Colors */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-5 grid grid-cols-3 gap-3"
                >
                    <div className="bg-teal-50 rounded-lg p-2.5 text-center border border-teal-100">
                        <FiShoppingCart className="mx-auto mb-1 text-teal-500" size={16} />
                        <p className="text-gray-600 text-xs">Avg Order Value</p>
                        <p className="font-bold text-gray-800 text-sm">{formatCurrency(stats.sales / (stats.invoices || 1))}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2.5 text-center border border-emerald-100">
                        <FiAward className="mx-auto mb-1 text-emerald-500" size={16} />
                        <p className="text-gray-600 text-xs">Completion Rate</p>
                        <p className="font-bold text-gray-800 text-sm">98%</p>
                    </div>
                    <div className="bg-rose-50 rounded-lg p-2.5 text-center border border-rose-100">
                        <FiTrendingUp className="mx-auto mb-1 text-rose-500" size={16} />
                        <p className="text-gray-600 text-xs">Growth</p>
                        <p className="font-bold text-gray-800 text-sm">+12%</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;