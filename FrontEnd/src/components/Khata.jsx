import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API_URL from "../config";
import {
    FiUsers,
    FiUserPlus,
    FiPhone,
    FiDollarSign,
    FiTrendingUp,
    FiTrendingDown,
    FiRefreshCw,
    FiSearch,
    FiDownload,
    FiAlertCircle,
    FiCheckCircle,
    FiEdit2,
    FiTrash2,
    FiPlus,
    FiMinus,
    FiSave,
    FiX,
    FiClock,
    FiList,
    FiCalendar,
    FiInfo,
    FiMenu
} from "react-icons/fi";
import { handleSuccess, handleError } from "../utils";
import { ToastContainer } from "react-toastify";

const Khata = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [transactionAmount, setTransactionAmount] = useState("");
    const [transactionType, setTransactionType] = useState("payment");
    const [transactionNote, setTransactionNote] = useState("");
    const [editForm, setEditForm] = useState({
        customerName: "",
        phoneNumber: ""
    });
    const [form, setForm] = useState({
        customerName: "",
        phoneNumber: "",
        openingBalance: ""
    });

    // use API_URL from config
    const API = API_URL;

    const getAuthHeader = () => {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`
        };
    };

    const fetchKhatas = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API}/khata`, {
                headers: getAuthHeader()
            });
            const data = await res.json();

            const khataWithTransactions = await Promise.all(
                (data.data || []).map(async (khata) => {
                    try {
                        const transactionsRes = await fetch(`${API}/khata/${khata._id}/transactions`, {
                            headers: getAuthHeader()
                        });
                        if (transactionsRes.ok) {
                            const transactionsData = await transactionsRes.json();
                            return {
                                ...khata,
                                transactions: transactionsData.data || []
                            };
                        }
                        return { ...khata, transactions: [] };
                    } catch (error) {
                        console.error(`Error fetching transactions for ${khata._id}:`, error);
                        return { ...khata, transactions: [] };
                    }
                })
            );

            setCustomers(khataWithTransactions);
        } catch (error) {
            console.log("Fetch error:", error);
            handleError("Failed to fetch khata records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKhatas();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const normalizePhone = (phone) => {
        let cleaned = phone.replace(/\D/g, "");

        if (cleaned.startsWith("92")) {
            cleaned = "0" + cleaned.slice(2);
        }

        if (!cleaned.startsWith("0")) {
            cleaned = "0" + cleaned;
        }

        return cleaned;
    };

    const addCustomer = async (e) => {
        e.preventDefault();

        if (!form.customerName.trim()) {
            handleError("Customer name is required");
            return;
        }

        const normalizedPhone = normalizePhone(form.phoneNumber);

        try {
            const existingCustomer = customers.find(
                (c) => c.phoneNumber === normalizedPhone
            );

            if (existingCustomer) {
                const res = await fetch(`${API}/khata/${existingCustomer._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeader()
                    },
                    body: JSON.stringify({
                        customerName: form.customerName,
                        phoneNumber: normalizedPhone,
                        remainingBalance:
                            existingCustomer.remainingBalance +
                            (Number(form.openingBalance) || 0)
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    const updatedCustomers = customers.map((c) =>
                        c._id === existingCustomer._id
                            ? { ...c, ...data.data }
                            : c
                    );
                    setCustomers(updatedCustomers);
                    handleSuccess("Existing customer updated instead of creating duplicate!");
                } else {
                    handleError(data.message || "Error updating customer");
                }
            } else {
                const newKhata = {
                    customerName: form.customerName,
                    phoneNumber: normalizedPhone,
                    openingBalance: Number(form.openingBalance) || 0,
                    remainingBalance: Number(form.openingBalance) || 0
                };

                const res = await fetch(`${API}/khata`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeader()
                    },
                    body: JSON.stringify(newKhata)
                });

                const data = await res.json();

                if (res.ok) {
                    setCustomers([{ ...data.data, transactions: [] }, ...customers]);
                    handleSuccess("New Khata created!");
                } else {
                    handleError(data.message || "Error creating khata");
                }
            }

            setForm({
                customerName: "",
                phoneNumber: "",
                openingBalance: ""
            });

        } catch (error) {
            console.log(error);
            handleError("Server error while processing khata");
        }
    };

    const handleEditCustomer = async () => {
        try {
            const res = await fetch(`${API}/khata/${selectedCustomer._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    customerName: editForm.customerName,
                    phoneNumber: editForm.phoneNumber
                })
            });

            const data = await res.json();

            if (res.ok) {
                const updatedCustomers = customers.map(customer =>
                    customer._id === selectedCustomer._id
                        ? { ...customer, customerName: editForm.customerName, phoneNumber: editForm.phoneNumber }
                        : customer
                );
                setCustomers(updatedCustomers);
                setShowEditModal(false);
                handleSuccess("Customer updated successfully!");
            } else {
                handleError(data.message || "Error updating customer");
            }
        } catch (error) {
            console.log(error);
            handleError("Server error while updating customer");
        }
    };

    const handleDeleteCustomer = async () => {
        try {
            const res = await fetch(`${API}/khata/${selectedCustomer._id}`, {
                method: "DELETE",
                headers: getAuthHeader()
            });

            const data = await res.json();

            if (res.ok) {
                const updatedCustomers = customers.filter(
                    customer => customer._id !== selectedCustomer._id
                );
                setCustomers(updatedCustomers);
                setShowDeleteConfirm(false);
                handleSuccess("Customer deleted successfully!");
            } else {
                handleError(data.message || "Error deleting customer");
            }
        } catch (error) {
            console.log(error);
            handleError("Server error while deleting customer");
        }
    };

    const handleTransaction = async () => {
        if (!transactionAmount || Number(transactionAmount) <= 0) {
            handleError("Please enter a valid amount");
            return;
        }

        const amount = Number(transactionAmount);

        let newBalance =
            transactionType === "payment"
                ? selectedCustomer.remainingBalance - amount
                : selectedCustomer.remainingBalance + amount;

        const payload = {
            amount,
            type: transactionType,
            note: transactionNote,
            remainingBalance: newBalance
        };

        try {
            const res = await fetch(
                `${API}/khata/${selectedCustomer._id}/transaction`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeader()
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            const updatedCustomers = customers.map((customer) =>
                customer._id === selectedCustomer._id
                    ? {
                        ...customer,
                        remainingBalance: newBalance,
                        transactions: [
                            ...(customer.transactions || []),
                            data.transaction
                        ]
                    }
                    : customer
            );

            setCustomers(updatedCustomers);
            setShowTransactionModal(false);
            setTransactionAmount("");
            setTransactionNote("");

            handleSuccess(
                `${transactionType === "payment" ? "Payment" : "Credit"} recorded successfully!`
            );
        } catch (error) {
            console.log(error);
            handleError(error.message || "Server error");
        }
    };

    const openEditModal = (customer) => {
        setSelectedCustomer(customer);
        setEditForm({
            customerName: customer.customerName,
            phoneNumber: customer.phoneNumber || ""
        });
        setShowEditModal(true);
    };

    const openTransactionModal = (customer) => {
        setSelectedCustomer(customer);
        setTransactionAmount("");
        setTransactionNote("");
        setTransactionType("payment");
        setShowTransactionModal(true);
    };

    const openHistoryModal = async (customer) => {
        setSelectedCustomer(customer);
        try {
            const transactionsRes = await fetch(`${API}/khata/${customer._id}/transactions`, {
                headers: getAuthHeader()
            });
            if (transactionsRes.ok) {
                const transactionsData = await transactionsRes.json();
                const updatedCustomer = { ...customer, transactions: transactionsData.data || [] };
                setSelectedCustomer(updatedCustomer);
                const updatedCustomers = customers.map(c =>
                    c._id === customer._id ? updatedCustomer : c
                );
                setCustomers(updatedCustomers);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
        setShowHistoryModal(true);
    };

    const handleExportCSV = () => {
        const headers = ['Customer Name', 'Phone Number', 'Opening Balance', 'Remaining Balance', 'Status'];
        const csvData = filteredCustomers.map(customer => [
            customer.customerName,
            customer.phoneNumber || '-',
            customer.openingBalance?.toFixed(2) || "0.00",
            customer.remainingBalance?.toFixed(2) || "0.00",
            customer.remainingBalance >= 0 ? 'You Will Receive' : 'You Will Pay'
        ]);

        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khata_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        handleSuccess('Khata report exported successfully');
    };

    const exportCustomerTransactions = (customer) => {
        const headers = ['Date', 'Type', 'Amount', 'Note'];
        const csvData = (customer.transactions || []).map(transaction => [
            new Date(transaction.date).toLocaleString(),
            transaction.type === 'payment' ? 'Payment Received' : 'New Credit',
            transaction.amount.toFixed(2),
            transaction.note || '-'
        ]);

        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${customer.customerName}_transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        handleSuccess('Transaction history exported successfully');
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Invalid Date";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            return date.toLocaleDateString('en-PK', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return "Invalid Date";
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phoneNumber && customer.phoneNumber.includes(searchTerm))
    );

    const totalCustomers = customers.length;
    const totalReceivable = customers.reduce((sum, c) => c.remainingBalance > 0 ? sum + c.remainingBalance : sum, 0);
    const totalPayable = customers.reduce((sum, c) => c.remainingBalance < 0 ? sum + Math.abs(c.remainingBalance) : sum, 0);
    const netBalance = totalReceivable - totalPayable;

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        whileHover: { y: -5, transition: { duration: 0.2 } }
    };

    const statsCards = [
        { label: 'Total Customers', value: totalCustomers, icon: FiUsers, color: 'blue', prefix: '', suffix: '' },
        { label: 'Total Receivable', value: totalReceivable.toFixed(2), icon: FiTrendingUp, color: 'green', prefix: 'Rs. ', suffix: '' },
        { label: 'Total Payable', value: totalPayable.toFixed(2), icon: FiTrendingDown, color: 'red', prefix: 'Rs. ', suffix: '' },
        { label: 'Net Balance', value: Math.abs(netBalance).toFixed(2), icon: FiDollarSign, color: 'purple', prefix: 'Rs. ', suffix: netBalance >= 0 ? '' : '', sign: netBalance >= 0 ? '+' : '-' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8"
                >
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                            className="bg-blue-600 p-2 rounded-xl"
                        >
                            <FiUsers className="text-white text-xl sm:text-2xl" />
                        </motion.div>
                        Khata Management
                    </h1>
                    <p className="text-gray-600 mt-2 ml-2 text-sm sm:text-base">Manage customer credits, debits, and transactions</p>
                </motion.div>

                {/* Stats Cards - Responsive Grid */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
                >
                    {statsCards.map((stat, idx) => {
                        const Icon = stat.icon;
                        const colorClasses = {
                            blue: 'border-blue-500',
                            green: 'border-green-500',
                            red: 'border-red-500',
                            purple: 'border-purple-500',
                        };
                        const textColorClasses = {
                            blue: 'text-gray-800',
                            green: 'text-green-600',
                            red: 'text-red-600',
                            purple: netBalance >= 0 ? 'text-green-600' : 'text-red-600',
                        };
                        const iconColorClasses = {
                            blue: 'text-blue-500',
                            green: 'text-green-500',
                            red: 'text-red-500',
                            purple: 'text-purple-500',
                        };
                        return (
                            <motion.div
                                key={stat.label}
                                variants={cardVariants}
                                className={`bg-white rounded-xl shadow-md p-3 sm:p-6 border-l-4 ${colorClasses[stat.color]}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-500 text-xs sm:text-sm truncate">{stat.label}</p>
                                        <p className={`text-base sm:text-2xl font-bold ${textColorClasses[stat.color]} truncate`}>
                                            {stat.sign === '-' && '-'}{stat.prefix}{stat.value}{stat.suffix}
                                        </p>
                                    </div>
                                    <Icon className={`${iconColorClasses[stat.color]} text-xl sm:text-3xl opacity-50 flex-shrink-0 ml-2`} />
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Add Khata Form - Responsive */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8"
                >
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FiUserPlus className="text-blue-600" />
                        Add New Khata
                    </h2>

                    <form onSubmit={addCustomer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Name *
                            </label>
                            <div className="relative">
                                <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="customerName"
                                    placeholder="Enter customer name"
                                    value={form.customerName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    placeholder="Enter phone number"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Opening Balance (Rs.)
                            </label>
                            <div className="relative">
                                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    name="openingBalance"
                                    placeholder="0.00"
                                    value={form.openingBalance}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500 hidden sm:block">
                                Positive = Customer owes you | Negative = You owe customer
                            </p>
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <FiUserPlus className="text-lg sm:text-xl" />
                                Save Khata
                            </motion.button>
                        </div>
                    </form>
                    <ToastContainer />
                </motion.div>

                {/* Filters and Actions - Responsive */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8"
                >
                    {/* Mobile Filter Toggle */}
                    <div className="flex items-center justify-between lg:hidden mb-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 text-sm"
                        >
                            <FiSearch />
                            {showFilters ? 'Hide Search' : 'Show Search'}
                        </button>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleExportCSV}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1"
                            >
                                <FiDownload className="text-sm" />
                                Export
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchKhatas}
                                className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm flex items-center gap-1"
                            >
                                <FiRefreshCw className="text-sm" />
                                Refresh
                            </motion.button>
                        </div>
                    </div>

                    <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                            <div className="flex flex-1">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="hidden lg:flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExportCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                >
                                    <FiDownload />
                                    Export CSV
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchKhatas}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                                >
                                    <FiRefreshCw />
                                    Refresh
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Khata Table - Responsive with Horizontal Scroll */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] lg:min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Phone
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Opening
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Balance
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                        Status
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {loading ? (
                                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
                                                />
                                            </td>
                                        </motion.tr>
                                    ) : filteredCustomers.length === 0 ? (
                                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                No khata records found
                                            </td>
                                        </motion.tr>
                                    ) : (
                                        filteredCustomers.map((customer, index) => (
                                            <motion.tr
                                                key={customer._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ backgroundColor: '#F9FAFB' }}
                                                className="transition"
                                            >
                                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                    <div className="font-medium text-gray-900 text-sm sm:text-base">{customer.customerName}</div>
                                                    {/* Mobile phone number */}
                                                    <div className="sm:hidden text-xs text-gray-500 mt-1">
                                                        {customer.phoneNumber || "-"}
                                                    </div>
                                                    {/* Mobile opening balance */}
                                                    <div className="md:hidden text-xs text-gray-500 mt-1">
                                                        Opening: Rs. {customer.openingBalance?.toFixed(2) || "0.00"}
                                                    </div>
                                                    {/* Mobile status */}
                                                    <div className="lg:hidden mt-2">
                                                        {customer.remainingBalance >= 0 ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                                                <FiTrendingUp className="text-xs" />
                                                                Receive
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                                                                <FiTrendingDown className="text-xs" />
                                                                Pay
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 hidden sm:table-cell">
                                                    {customer.phoneNumber || "-"}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 hidden md:table-cell">
                                                    Rs. {customer.openingBalance?.toFixed(2) || "0.00"}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                    <span className={`text-sm font-bold ${customer.remainingBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                        Rs. {customer.remainingBalance?.toFixed(2) || "0.00"}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                                                    {customer.remainingBalance >= 0 ? (
                                                        <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs whitespace-nowrap">
                                                            <FiTrendingUp className="text-xs" />
                                                            You Will Receive
                                                        </motion.span>
                                                    ) : (
                                                        <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs whitespace-nowrap">
                                                            <FiTrendingDown className="text-xs" />
                                                            You Will Pay
                                                        </motion.span>
                                                    )}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                    <div className="flex gap-1 sm:gap-2 flex-wrap">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => openHistoryModal(customer)}
                                                            className="p-1.5 sm:p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                            title="View Transaction History"
                                                        >
                                                            <FiClock className="text-sm sm:text-base" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => openTransactionModal(customer)}
                                                            className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                            title="Add Transaction"
                                                        >
                                                            <FiPlus className="text-sm sm:text-base" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => openEditModal(customer)}
                                                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Edit Customer"
                                                        >
                                                            <FiEdit2 className="text-sm sm:text-base" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => {
                                                                setSelectedCustomer(customer);
                                                                setShowDeleteConfirm(true);
                                                            }}
                                                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete Customer"
                                                        >
                                                            <FiTrash2 className="text-sm sm:text-base" />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Transaction History Modal - Responsive */}
            <AnimatePresence>
                {showHistoryModal && selectedCustomer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <FiClock className="text-indigo-600" />
                                        Transaction History
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                        {selectedCustomer.customerName} - {selectedCustomer.phoneNumber || "No phone"}
                                    </p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => exportCustomerTransactions(selectedCustomer)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm"
                                    >
                                        <FiDownload className="text-sm" />
                                        Export
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ rotate: 90 }}
                                        onClick={() => setShowHistoryModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <FiX className="text-xl" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Balance Summary - Responsive Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-600">Opening Balance</p>
                                    <p className="text-base sm:text-lg font-bold text-blue-600">Rs. {selectedCustomer.openingBalance?.toFixed(2)}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-600">Current Balance</p>
                                    <p className={`text-base sm:text-lg font-bold ${selectedCustomer.remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Rs. {selectedCustomer.remainingBalance?.toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-600">Total Transactions</p>
                                    <p className="text-base sm:text-lg font-bold text-gray-700">{selectedCustomer.transactions?.length || 0}</p>
                                </div>
                            </div>

                            {/* Transactions Table - Responsive */}
                            {selectedCustomer.transactions && selectedCustomer.transactions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[500px]">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date & Time
                                                </th>
                                                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                                    Note
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {[...(selectedCustomer.transactions || [])].reverse().map((transaction, index) => (
                                                <motion.tr
                                                    key={transaction._id || index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    whileHover={{ backgroundColor: '#F9FAFB' }}
                                                    className="transition"
                                                >
                                                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <FiCalendar className="text-xs" />
                                                            <span className="whitespace-nowrap">{formatDate(transaction.date)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3">
                                                        {transaction.type === "payment" ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs whitespace-nowrap">
                                                                <FiMinus className="text-xs" />
                                                                Payment
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs whitespace-nowrap">
                                                                <FiPlus className="text-xs" />
                                                                Credit
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-semibold ${transaction.type === "payment" ? "text-green-600" : "text-red-600"}`}>
                                                        {transaction.type === "payment" ? "-" : "+"} Rs. {transaction.amount?.toFixed(2) || "0.00"}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                                                        {transaction.note ? (
                                                            <div className="flex items-center gap-1">
                                                                <FiInfo className="text-xs text-gray-400" />
                                                                <span className="truncate max-w-[150px]">{transaction.note}</span>
                                                            </div>
                                                        ) : "-"}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FiList className="text-gray-300 text-5xl mx-auto mb-3" />
                                    <p className="text-gray-500">No transactions found</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setShowHistoryModal(false);
                                            openTransactionModal(selectedCustomer);
                                        }}
                                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                                    >
                                        <FiPlus />
                                        Add First Transaction
                                    </motion.button>
                                </div>
                            )}

                            <div className="flex justify-end mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowHistoryModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                                >
                                    Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Edit Customer Modal - Responsive */}
                {showEditModal && selectedCustomer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 sm:p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Edit Customer</h3>
                                <motion.button whileHover={{ rotate: 90 }} onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <FiX className="text-xl" />
                                </motion.button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                                    <input type="text" value={editForm.customerName} onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input type="text" value={editForm.phoneNumber} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleEditCustomer} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm">
                                    <FiSave /> Save Changes
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Transaction Modal - Responsive */}
                {showTransactionModal && selectedCustomer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 sm:p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Add Transaction</h3>
                                <motion.button whileHover={{ rotate: 90 }} onClick={() => setShowTransactionModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <FiX className="text-xl" />
                                </motion.button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Customer: <span className="font-semibold">{selectedCustomer.customerName}</span></p>
                                    <p className={`text-sm font-semibold mb-4 ${selectedCustomer.remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Current Balance: Rs. {selectedCustomer.remainingBalance?.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <label className="flex items-center gap-2">
                                            <input type="radio" value="payment" checked={transactionType === "payment"} onChange={(e) => setTransactionType(e.target.value)} className="text-blue-600" />
                                            <span className="flex items-center gap-1 text-sm"><FiMinus className="text-red-500" /> Payment Received</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" value="credit" checked={transactionType === "credit"} onChange={(e) => setTransactionType(e.target.value)} className="text-blue-600" />
                                            <span className="flex items-center gap-1 text-sm"><FiPlus className="text-green-500" /> New Credit</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (Rs.)</label>
                                    <input type="number" step="0.01" value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Enter amount" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                                    <textarea value={transactionNote} onChange={(e) => setTransactionNote(e.target.value)} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Add a note about this transaction..." />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleTransaction} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm">
                                    <FiSave /> Save Transaction
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowTransactionModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Delete Confirmation Modal - Responsive */}
                {showDeleteConfirm && selectedCustomer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 sm:p-6"
                        >
                            <div className="text-center">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <FiAlertCircle className="text-red-600 text-2xl" />
                                </motion.div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Delete Customer</h3>
                                <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete <span className="font-semibold">{selectedCustomer.customerName}</span>? This action cannot be undone.</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDeleteCustomer} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm">Delete</motion.button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm">Cancel</motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Khata;