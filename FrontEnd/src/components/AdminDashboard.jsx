import React, { useEffect, useState } from "react";
import {
    FiPackage,
    FiBox,
    FiDollarSign,
    FiFileText,
    FiTrendingUp,
    FiTrendingDown,
    FiUsers,
    FiShoppingCart,
    FiRefreshCw,
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
    FiArrowRight
} from "react-icons/fi";
import { handleError, handleSuccess } from "../utils";

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

            // Fetch all data in parallel for better performance
            const [productsRes, invoicesRes, khatasRes] = await Promise.all([
                fetch(`${API_URL}/products`),
                fetch(`${API_URL}/invoices`),
                fetch(`${API_URL}/khata`).catch(() => ({ ok: false })) // Khata might not exist
            ]);

            // Process Products Data
            let productsData = [];
            if (productsRes.ok) {
                const productsResult = await productsRes.json();
                productsData = productsResult.data || [];

                const totalProducts = productsData.length;
                const totalStock = productsData.reduce((sum, p) => sum + (p.quantity || 0), 0);
                const lowStock = productsData.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) < 10).length;
                const outOfStock = productsData.filter(p => (p.quantity || 0) === 0).length;

                // Get low stock products for display
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

            // Process Invoices Data
            let invoicesData = [];
            let totalSales = 0;
            if (invoicesRes.ok) {
                const invoicesResult = await invoicesRes.json();
                invoicesData = invoicesResult.data || [];
                totalSales = invoicesData.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

                // Get recent invoices (last 5)
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

            // Process Khata/Customers Data
            if (khatasRes.ok) {
                const khatasResult = await khatasRes.json();
                const khatasData = khatasResult.data || [];
                setStats(prev => ({
                    ...prev,
                    totalCustomers: khatasData.length
                }));
            }

            // Generate recent activities
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

        // Add recent product additions
        const recentProducts = products
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
        recentProducts.forEach(product => {
            activities.push({
                id: `product-${product._id}`,
                type: "product",
                message: `New product "${product.name}" added`,
                time: new Date(product.createdAt),
                icon: <FiPackage className="text-blue-500" />
            });
        });

        // Add recent invoices
        const recentInvoicesList = invoices
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
        recentInvoicesList.forEach(invoice => {
            activities.push({
                id: `invoice-${invoice._id}`,
                type: "invoice",
                message: `🧾 Invoice #${invoice.invoiceNumber} generated for Rs. ${invoice.grandTotal.toFixed(2)}`,
                time: new Date(invoice.createdAt),
                icon: <FiFileText className="text-green-500" />
            });
        });

        // Sort activities by time (most recent first)
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-PK');
    };

    const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
        <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-all duration-300`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            {trend === 'up' ?
                                <FiTrendingUp className="text-green-500 text-sm" /> :
                                <FiTrendingDown className="text-red-500 text-sm" />
                            }
                            <span className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {trendValue}
                            </span>
                        </div>
                    )}
                </div>
                <div className={`text-4xl opacity-80 ${color.replace('border-l-4', '').trim()}`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    const DashboardCard = ({ title, children, icon, color }) => (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className={`bg-gradient-to-r ${color} px-6 py-3`}>
                <h3 className="text-white font-semibold flex items-center gap-2">
                    {icon}
                    {title}
                </h3>
            </div>
            <div className="p-4">
                {children}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <FiTrendingUp className="text-white text-2xl" />
                        </div>
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2 ml-2">
                        Overview of your business performance and inventory status
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Products"
                        value={stats.products}
                        icon={<FiPackage className="text-blue-500" />}
                        color="border-blue-500"
                    />

                    <StatCard
                        title="Total Stock Units"
                        value={stats.stock}
                        icon={<FiBox className="text-green-500" />}
                        color="border-green-500"
                    />

                    <StatCard
                        title="Total Sales"
                        value={formatCurrency(stats.sales)}
                        icon={<FiDollarSign className="text-purple-500" />}
                        color="border-purple-500"
                        trend="up"
                        trendValue="+12% from last month"
                    />

                    <StatCard
                        title="Total Invoices"
                        value={stats.invoices}
                        icon={<FiFileText className="text-orange-500" />}
                        color="border-orange-500"
                    />
                </div>

                {/* Second Row Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Low Stock Items"
                        value={stats.lowStock}
                        icon={<FiAlertCircle className="text-yellow-500" />}
                        color="border-yellow-500"
                    />

                    <StatCard
                        title="Out of Stock"
                        value={stats.outOfStock}
                        icon={<FiAlertCircle className="text-red-500" />}
                        color="border-red-500"
                    />

                    <StatCard
                        title="Total Customers"
                        value={stats.totalCustomers}
                        icon={<FiUsers className="text-indigo-500" />}
                        color="border-indigo-500"
                    />
                </div>

                {/* Two Column Layout for Recent Activity and Low Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Recent Activity */}
                    <DashboardCard
                        title="Recent Activity"
                        icon={<FiClock className="text-white" />}
                        color="from-blue-600 to-blue-700"
                    >
                        <div className="space-y-3">
                            {recentActivities.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No recent activities</p>
                            ) : (
                                recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div className="mt-1">{activity.icon}</div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700">{activity.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{formatDate(activity.time)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button
                            onClick={fetchDashboardData}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm"
                        >
                            <FiRefreshCw />
                            Refresh Activity
                        </button>
                    </DashboardCard>

                    {/* Low Stock Alerts */}
                    <DashboardCard
                        title="Low Stock Alerts"
                        icon={<FiAlertCircle className="text-white" />}
                        color="from-red-600 to-red-700"
                    >
                        <div className="space-y-3">
                            {lowStockProducts.length === 0 ? (
                                <div className="text-center py-8">
                                    <FiCheckCircle className="text-green-500 text-4xl mx-auto mb-2" />
                                    <p className="text-gray-500">All products have sufficient stock!</p>
                                </div>
                            ) : (
                                lowStockProducts.map((product) => (
                                    <div key={product._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                                        <div>
                                            <p className="font-medium text-gray-800">{product.name}</p>
                                            <p className="text-xs text-gray-500">SKU: {product._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-orange-600">Stock: {product.quantity} units</p>
                                            <p className="text-xs text-gray-500">Critical level</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {lowStockProducts.length > 0 && (
                            <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm">
                                View All Low Stock Items
                                <FiArrowRight />
                            </button>
                        )}
                    </DashboardCard>
                </div>

                {/* Recent Invoices */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <FiFileText />
                            Recent Invoices
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        {recentInvoices.length === 0 ? (
                            <div className="text-center py-12">
                                <FiFileText className="text-gray-300 text-5xl mx-auto mb-3" />
                                <p className="text-gray-500">No invoices generated yet</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Invoice #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentInvoices.map((invoice) => (
                                        <tr key={invoice._id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900">
                                                {invoice.invoiceNumber}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{invoice.customer.name}</div>
                                                {invoice.customer.phone && (
                                                    <div className="text-xs text-gray-500">{invoice.customer.phone}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(invoice.createdAt).toLocaleDateString('en-PK')}
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                {formatCurrency(invoice.grandTotal)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                    <FiCheckCircle className="text-xs" />
                                                    Paid
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Refresh Button at Bottom */}
                <div className="mt-6 text-center">
                    <button
                        onClick={fetchDashboardData}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition shadow-md"
                    >
                        <FiRefreshCw />
                        Refresh Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;