import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    FiAward,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiPrinter,
    FiEye,
    FiList,
    FiChevronDown,
    FiChevronUp,
    FiAlertTriangle
} from "react-icons/fi";
import { handleError } from "../utils";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        products: 0,
        stock: 0,
        sales: 0,
        invoices: 0,
        lowStock: 0,
        outOfStock: 0,
        totalCustomers: 0,
        pendingPayments: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [allInvoices, setAllInvoices] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [error, setError] = useState(null);
    const [showAllInvoices, setShowAllInvoices] = useState(false);

    // Daily Sales State
    const [dailySales, setDailySales] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dailyTotal, setDailyTotal] = useState(0);
    const [dailyStats, setDailyStats] = useState({
        totalInvoices: 0,
        totalItems: 0,
        averageOrderValue: 0
    });
    const [expandedInvoice, setExpandedInvoice] = useState(null);

    const API_URL = "http://localhost:8080";

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    // Helper function for authenticated fetch
    const authFetch = async (url, options = {}) => {
        const headers = getAuthHeaders();
        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
        }

        return response;
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        fetchDashboardData();
        fetchDailySales();
    }, []);

    useEffect(() => {
        fetchDailySales();
    }, [selectedDate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [productsRes, invoicesRes, khatasRes] = await Promise.all([
                authFetch(`${API_URL}/products`),
                authFetch(`${API_URL}/invoices/all`),
                authFetch(`${API_URL}/khata`).catch(() => ({ ok: false }))
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
            let pendingCount = 0;

            if (invoicesRes.ok) {
                const invoicesResult = await invoicesRes.json();
                invoicesData = invoicesResult.data || [];
                totalSales = invoicesData.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

                // Calculate pending payments
                pendingCount = invoicesData.filter(inv =>
                    inv.payment?.paymentStatus === "partial" ||
                    inv.payment?.remainingAmount > 0
                ).length;

                // Store all invoices
                const sortedInvoices = invoicesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setAllInvoices(sortedInvoices);

                // Only show 3 most recent invoices initially
                const recent = sortedInvoices.slice(0, 3);
                setRecentInvoices(recent);

                setStats(prev => ({
                    ...prev,
                    invoices: invoicesData.length,
                    sales: totalSales,
                    pendingPayments: pendingCount
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
            setError(error.message || "Failed to load dashboard data");
            handleError(error.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const fetchDailySales = async () => {
        try {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const response = await authFetch(`${API_URL}/invoices?date=${dateStr}`);

            if (!response.ok) throw new Error("Failed to fetch sales");

            const result = await response.json();
            const invoices = result.data || [];

            // Group by invoice with payment info
            const groupedInvoices = invoices.map((invoice) => {
                const items = (invoice.items || []).map((item) => ({
                    product: item.product,
                    qty: item.qty || 0,
                    price: item.price || 0,
                    total: item.total || (item.qty * item.price)
                }));

                const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

                return {
                    invoiceId: invoice._id,
                    invoiceNumber: invoice.invoiceNumber,
                    items: items,
                    totalItems: totalItems,
                    totalAmount: invoice.grandTotal,
                    customerName: invoice.customer?.name || "Walk-in Customer",
                    customerPhone: invoice.customer?.phone || "",
                    createdAt: invoice.createdAt,
                    pricingType: invoice.pricingType,
                    paymentStatus: invoice.payment?.paymentStatus || "paid",
                    remainingAmount: invoice.payment?.remainingAmount || 0,
                    paidAmount: invoice.payment?.paidAmount || invoice.grandTotal
                };
            });

            const totalAmount = groupedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
            const totalItems = groupedInvoices.reduce((sum, inv) => sum + inv.totalItems, 0);

            setDailySales(groupedInvoices);
            setDailyTotal(totalAmount);
            setDailyStats({
                totalInvoices: result.count || invoices.length,
                totalItems: totalItems,
                averageOrderValue: invoices.length > 0 ? totalAmount / invoices.length : 0
            });

        } catch (error) {
            console.error("Error fetching daily sales:", error);
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
                message: `New product added: ${product.name}`,
                time: new Date(product.createdAt),
                type: "product"
            });
        });

        const recentInvoicesList = invoices
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
        recentInvoicesList.forEach(invoice => {
            const status = invoice.payment?.paymentStatus === "partial" ? " (Partial Payment)" : "";
            activities.push({
                id: `invoice-${invoice._id}`,
                message: `Invoice ${invoice.invoiceNumber} created - ${formatCurrency(invoice.grandTotal)}${status}`,
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

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (newDate > today) {
            return;
        }
        setSelectedDate(newDate);
    };

    const setToday = () => {
        setSelectedDate(new Date());
    };

    const formatDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(date);
        selected.setHours(0, 0, 0, 0);

        const isToday = selected.getTime() === today.getTime();
        const isYesterday = selected.getTime() === today.getTime() - 86400000;

        if (isToday) {
            return `Today, ${date.toLocaleDateString('en-PK', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        } else if (isYesterday) {
            return `Yesterday, ${date.toLocaleDateString('en-PK', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        } else {
            return date.toLocaleDateString('en-PK', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    const handlePrintDailySales = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Daily Sales Report - ${formatDate(selectedDate)}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; font-size: 24px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .summary { display: flex; justify-content: space-between; margin-bottom: 20px; }
                        .summary-card { background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; flex: 1; margin: 0 5px; }
                        .summary-card h3 { margin: 0 0 10px 0; font-size: 16px; }
                        .summary-card p { margin: 0; font-size: 20px; font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #4CAF50; color: white; font-size: 14px; }
                        td { font-size: 12px; }
                        .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
                        @media print {
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Daily Sales Report</h1>
                        <p>${formatDate(selectedDate)}</p>
                    </div>
                    <div class="summary">
                        <div class="summary-card">
                            <h3>Total Sales</h3>
                            <p>${formatCurrency(dailyTotal)}</p>
                        </div>
                        <div class="summary-card">
                            <h3>Total Invoices</h3>
                            <p>${dailyStats.totalInvoices}</p>
                        </div>
                        <div class="summary-card">
                            <h3>Items Sold</h3>
                            <p>${dailyStats.totalItems}</p>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr><th>Invoice #</th><th>Products</th><th>Total Items</th><th>Amount</th><th>Status</th><th>Customer</th></tr>
                        </thead>
                        <tbody>
                            ${dailySales.map(sale => `
                                <tr>
                                    <td><strong>${sale.invoiceNumber}</strong></td>
                                    <td>
                                        ${sale.items.map(item => `${item.product} (${item.qty})`).join(', ')}
                                    </td>
                                    <td>${sale.totalItems}</td>
                                    <td>${formatCurrency(sale.totalAmount)}</td>
                                    <td>
                                        ${sale.paymentStatus === 'partial' ? '⚠ Partial' : '✓ Paid'}
                                        ${sale.remainingAmount > 0 ? `<br/><small>Due: ${formatCurrency(sale.remainingAmount)}</small>` : ''}
                                    </td>
                                    <td>${sale.customerName}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        Grand Total: ${formatCurrency(dailyTotal)}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleViewInvoice = (invoiceId) => {
        navigate(`/invoice/${invoiceId}`);
    };

    const toggleExpandedInvoice = (invoiceId) => {
        if (expandedInvoice === invoiceId) {
            setExpandedInvoice(null);
        } else {
            setExpandedInvoice(invoiceId);
        }
    };

    const handleViewAllInvoices = () => {
        setRecentInvoices(allInvoices);
        setShowAllInvoices(true);
    };

    const handleShowLessInvoices = () => {
        const recent = allInvoices.slice(0, 3);
        setRecentInvoices(recent);
        setShowAllInvoices(false);
    };

    const StatCard = ({ title, value, icon, bgColor, iconColor, borderColor }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`${bgColor} rounded-lg p-4 border ${borderColor} shadow-sm hover:shadow transition-all cursor-pointer`}
            onClick={() => {
                if (title === "Invoices") {
                    navigate("/invoices");
                } else if (title === "Products") {
                    navigate("/products");
                } else if (title === "Customers") {
                    navigate("/khata");
                } else if (title === "Pending") {
                    navigate("/invoices?status=partial");
                }
            }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                </div>
                <div className={`${iconColor} text-3xl`}>
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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
                    <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Dashboard</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-5">
                {/* Header with Logout Button */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                            <p className="text-gray-500 text-sm mt-1">Welcome back! Here's your business overview</p>
                        </div>
                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05, rotate: 180 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchDashboardData}
                                className="p-2 bg-white rounded-lg shadow-sm hover:shadow text-gray-600 transition-all"
                                title="Refresh"
                            >
                                <FiRefreshCw size={18} />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid - Row 1 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

                {/* Stats Grid - Row 2 */}
                <div className="grid grid-cols-4 gap-4 mb-8">
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
                    <StatCard
                        title="Pending"
                        value={stats.pendingPayments}
                        icon={<FiAlertTriangle />}
                        bgColor="bg-amber-50"
                        iconColor="text-amber-500"
                        borderColor="border-amber-100"
                    />
                </div>

                {/* Daily Sales Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg mb-8 overflow-hidden"
                >
                    <div className="px-6 py-5">
                        <div className="flex justify-between items-center mb-5">
                            <div className="flex items-center gap-3">
                                <FiCalendar className="text-white text-2xl" />
                                <h2 className="text-white font-bold text-2xl">Daily Sales Report</h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrintDailySales}
                                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium flex items-center gap-2"
                                >
                                    <FiPrinter size={16} />
                                    Print Report
                                </button>
                            </div>
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center justify-between bg-white/10 rounded-lg p-4 mb-5">
                            <button
                                onClick={() => changeDate(-1)}
                                className="p-2 hover:bg-white/20 rounded-lg transition text-white"
                            >
                                <FiChevronLeft size={24} />
                            </button>
                            <div className="text-center">
                                <p className="text-white text-lg font-semibold">{formatDate(selectedDate)}</p>
                                <button
                                    onClick={setToday}
                                    className="text-white/80 text-sm hover:text-white mt-1"
                                >
                                    Go to Today
                                </button>
                            </div>
                            <button
                                onClick={() => changeDate(1)}
                                className="p-2 hover:bg-white/20 rounded-lg transition text-white"
                                disabled={selectedDate >= new Date()}
                            >
                                <FiChevronRight size={24} />
                            </button>
                        </div>

                        {/* Daily Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            <div className="bg-white/20 rounded-lg p-4 text-center">
                                <p className="text-white/90 text-sm mb-1">Total Sales</p>
                                <p className="text-white font-bold text-2xl">{formatCurrency(dailyTotal)}</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-4 text-center">
                                <p className="text-white/90 text-sm mb-1">Total Invoices</p>
                                <p className="text-white font-bold text-2xl">{dailyStats.totalInvoices}</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-4 text-center">
                                <p className="text-white/90 text-sm mb-1">Items Sold</p>
                                <p className="text-white font-bold text-2xl">{dailyStats.totalItems}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sales Items Table - Grouped by Invoice */}
                    <div className="bg-white">
                        <div className="max-h-[500px] overflow-auto">
                            {dailySales.length === 0 ? (
                                <div className="text-center py-12">
                                    <FiShoppingCart className="mx-auto text-gray-300 text-5xl mb-4" />
                                    <p className="text-gray-400 text-base">No sales recorded for this date</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Invoice #</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Products</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Total Items</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Total Amount</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <AnimatePresence>
                                            {dailySales.map((sale, idx) => (
                                                <React.Fragment key={sale.invoiceId}>
                                                    <motion.tr
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-3 font-mono text-sm font-semibold text-gray-700">
                                                            {sale.invoiceNumber}
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-800">
                                                                    {sale.items.length > 1
                                                                        ? `${sale.items[0].product} + ${sale.items.length - 1} more item(s)`
                                                                        : sale.items[0].product}
                                                                </span>
                                                                {sale.items.length > 1 && (
                                                                    <button
                                                                        onClick={() => toggleExpandedInvoice(sale.invoiceId)}
                                                                        className="text-blue-600 hover:text-blue-800 transition"
                                                                        title="View all products"
                                                                    >
                                                                        {expandedInvoice === sale.invoiceId ? (
                                                                            <FiChevronUp size={16} />
                                                                        ) : (
                                                                            <FiChevronDown size={16} />
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3 text-center text-sm text-gray-700">
                                                            {sale.totalItems}
                                                        </td>
                                                        <td className="px-6 py-3 text-right font-semibold text-sm text-gray-800">
                                                            {formatCurrency(sale.totalAmount)}
                                                        </td>
                                                        <td className="px-6 py-3 text-center">
                                                            {sale.paymentStatus === "partial" ? (
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                                                        <FiAlertTriangle size={10} />
                                                                        Partial
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        Due: {formatCurrency(sale.remainingAmount)}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                                    <FiCheckCircle size={10} />
                                                                    Paid
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <div className="text-sm font-medium text-gray-800">{sale.customerName}</div>
                                                            {sale.customerPhone && (
                                                                <div className="text-xs text-gray-500">{sale.customerPhone}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-3 text-center">
                                                            <button
                                                                onClick={() => handleViewInvoice(sale.invoiceId)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                                                            >
                                                                <FiEye size={14} />
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </motion.tr>

                                                    {/* Expanded Products Row */}
                                                    <AnimatePresence>
                                                        {expandedInvoice === sale.invoiceId && (
                                                            <motion.tr
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="bg-gray-50"
                                                            >
                                                                <td colSpan="7" className="px-6 py-4">
                                                                    <div className="space-y-2">
                                                                        <p className="font-semibold text-gray-700 text-sm mb-2">All Products:</p>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            {sale.items.map((item, itemIdx) => (
                                                                                <div key={itemIdx} className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                                                                                    <div className="flex-1">
                                                                                        <p className="font-medium text-gray-800 text-sm">{item.product}</p>
                                                                                        <p className="text-xs text-gray-500">Price: {formatCurrency(item.price)}</p>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <p className="text-sm text-gray-700">Qty: {item.qty}</p>
                                                                                        <p className="font-semibold text-sm text-blue-600">{formatCurrency(item.total)}</p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        )}
                                                    </AnimatePresence>
                                                </React.Fragment>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                    <tfoot className="bg-gray-50 sticky bottom-0">
                                        <tr className="border-t-2 border-gray-200">
                                            <td colSpan="3" className="px-6 py-4 text-right font-bold text-base text-gray-800">
                                                Grand Total:
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-lg text-blue-600">
                                                {formatCurrency(dailyTotal)}
                                            </td>
                                            <td colSpan="3"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Middle Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                        <div className="bg-blue-500 px-6 py-3">
                            <h3 className="text-white font-semibold flex items-center gap-2 text-base">
                                <FiClock size={18} />
                                Recent Activity
                            </h3>
                        </div>
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            {recentActivities.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No recent activity</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentActivities.map((activity, idx) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded transition-all"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                                            <div className="flex-1">
                                                <p className="text-gray-700 text-sm">{activity.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{getTimeAgo(activity.time)}</p>
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
                        <div className="bg-red-500 px-6 py-3">
                            <h3 className="text-white font-semibold flex items-center gap-2 text-base">
                                <FiAlertCircle size={18} />
                                Low Stock Alerts
                            </h3>
                        </div>
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            {lowStockProducts.length === 0 ? (
                                <div className="text-center py-8">
                                    <FiCheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                                    <p className="text-gray-500">All products have sufficient stock!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lowStockProducts.map((product, idx) => (
                                        <motion.div
                                            key={product._id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ scale: 1.01 }}
                                            className="flex items-center justify-between p-3 bg-yellow-50 rounded border-l-4 border-yellow-400"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                                                <p className="text-sm text-gray-600 mt-1">Stock: {product.quantity} units</p>
                                            </div>
                                            <div className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm font-medium">
                                                LOW
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Recent Invoices - Show only 3 with View All button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-lg shadow-sm overflow-hidden mb-8"
                >
                    <div className="bg-purple-500 px-6 py-3 flex justify-between items-center">
                        <h3 className="text-white font-semibold flex items-center gap-2 text-base">
                            <FiFileText size={18} />
                            Recent Invoices
                        </h3>
                        {stats.invoices > 3 && (
                            <button
                                onClick={showAllInvoices ? handleShowLessInvoices : handleViewAllInvoices}
                                className="flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition text-sm"
                            >
                                <FiList size={14} />
                                {showAllInvoices ? "Show Less" : `View All (${stats.invoices})`}
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        {recentInvoices.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400">No invoices generated yet</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Invoice #</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Customer</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Amount</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Status</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentInvoices.slice(0, showAllInvoices ? recentInvoices.length : 3).map((invoice, idx) => {
                                        const isPartial = invoice.payment?.paymentStatus === "partial" || invoice.payment?.remainingAmount > 0;
                                        return (
                                            <motion.tr
                                                key={invoice._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                whileHover={{ backgroundColor: '#F9FAFB' }}
                                                className="cursor-pointer"
                                            >
                                                <td className="px-6 py-3 font-mono text-sm font-semibold text-gray-900">
                                                    {invoice.invoiceNumber}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="text-sm font-medium text-gray-900">{invoice.customer.name}</div>
                                                    {invoice.customer.phone && (
                                                        <div className="text-xs text-gray-500">{invoice.customer.phone}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-500">
                                                    {new Date(invoice.createdAt).toLocaleDateString('en-PK', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-3 text-right font-semibold text-gray-900 text-sm">
                                                    {formatCurrency(invoice.grandTotal)}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    {isPartial ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                                                <FiAlertTriangle size={10} />
                                                                Partial
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                Due: {formatCurrency(invoice.payment?.remainingAmount || 0)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                            <FiCheckCircle size={10} />
                                                            Paid
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <button
                                                        onClick={() => handleViewInvoice(invoice._id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                                                    >
                                                        <FiEye size={14} />
                                                        View Details
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>

                {/* Quick Stats Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-3 gap-4"
                >
                    <div className="bg-teal-50 rounded-lg p-4 text-center border border-teal-100">
                        <FiShoppingCart className="mx-auto mb-2 text-teal-500 text-2xl" />
                        <p className="text-gray-600 text-sm mb-1">Avg Order Value</p>
                        <p className="font-bold text-gray-800 text-xl">{formatCurrency(dailyStats.averageOrderValue)}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-100">
                        <FiAward className="mx-auto mb-2 text-emerald-500 text-2xl" />
                        <p className="text-gray-600 text-sm mb-1">Completion Rate</p>
                        <p className="font-bold text-gray-800 text-xl">98%</p>
                    </div>
                    <div className="bg-rose-50 rounded-lg p-4 text-center border border-rose-100">
                        <FiTrendingUp className="mx-auto mb-2 text-rose-500 text-2xl" />
                        <p className="text-gray-600 text-sm mb-1">Growth</p>
                        <p className="font-bold text-gray-800 text-xl">+12%</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;