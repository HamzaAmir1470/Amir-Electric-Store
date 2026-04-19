import React, { useEffect, useState } from "react";
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
    FiPrinter,
    FiList,
    FiCalendar,
    FiInfo
} from "react-icons/fi";
import { ToastContainer } from "react-toastify";
import { handleSuccess, handleError } from "../utils";

const Khata = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [notification, setNotification] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
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

    const API = "http://localhost:8080/khata";

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchKhatas = async () => {
        try {
            setLoading(true);
            const res = await fetch(API);
            const data = await res.json();
            setCustomers(data.data || []);
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

    const addCustomer = async (e) => {
        e.preventDefault();

        if (!form.customerName.trim()) {
            handleError("Customer name is required");
            return;
        }

        try {
            const newKhata = {
                customerName: form.customerName,
                phoneNumber: form.phoneNumber,
                openingBalance: Number(form.openingBalance) || 0,
                remainingBalance: Number(form.openingBalance) || 0,
                transactions: []
            };

            const res = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newKhata)
            });

            const data = await res.json();

            if (res.ok) {
                setCustomers([data.data, ...customers]);
                setForm({
                    customerName: "",
                    phoneNumber: "",
                    openingBalance: ""
                });
                showNotification("Khata added successfully!", "success");
                handleSuccess("Khata added successfully!");
            } else {
                handleError(data.message || "Error creating khata");
            }
        } catch (error) {
            console.log(error);
            handleError("Server error while creating khata");
        }
    };

    const handleEditCustomer = async () => {
        try {
            const res = await fetch(`${API}/${selectedCustomer._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
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
                showNotification("Customer updated successfully!", "success");
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
            const res = await fetch(`${API}/${selectedCustomer._id}`, {
                method: "DELETE"
            });

            const data = await res.json();

            if (res.ok) {
                const updatedCustomers = customers.filter(
                    customer => customer._id !== selectedCustomer._id
                );
                setCustomers(updatedCustomers);
                setShowDeleteConfirm(false);
                showNotification("Customer deleted successfully!", "success");
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
        let newBalance = selectedCustomer.remainingBalance;

        if (transactionType === "payment") {
            newBalance = selectedCustomer.remainingBalance - amount;
        } else {
            newBalance = selectedCustomer.remainingBalance + amount;
        }

        const newTransaction = {
            amount: amount,
            type: transactionType,
            note: transactionNote,
            date: new Date().toISOString(),
            balanceAfter: newBalance
        };

        try {
            const res = await fetch(`${API}/${selectedCustomer._id}/transaction`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    remainingBalance: newBalance,
                    transaction: newTransaction
                })
            });

            const data = await res.json();

            if (res.ok) {
                const updatedCustomers = customers.map(customer =>
                    customer._id === selectedCustomer._id
                        ? {
                            ...customer,
                            remainingBalance: newBalance,
                            transactions: [...(customer.transactions || []), newTransaction]
                        }
                        : customer
                );
                setCustomers(updatedCustomers);
                setShowTransactionModal(false);
                setTransactionAmount("");
                setTransactionNote("");
                showNotification(
                    `${transactionType === "payment" ? "Payment" : "Credit"} recorded successfully!`,
                    "success"
                );
            } else {
                handleError(data.message || "Error recording transaction");
            }
        } catch (error) {
            console.log(error);
            handleError("Server error while recording transaction");
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

    const openHistoryModal = (customer) => {
        setSelectedCustomer(customer);
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
        showNotification('Khata report exported successfully', 'success');
    };

    const exportCustomerTransactions = (customer) => {
        const headers = ['Date', 'Type', 'Amount', 'Balance After', 'Note'];
        const csvData = (customer.transactions || []).map(transaction => [
            new Date(transaction.date).toLocaleString(),
            transaction.type === 'payment' ? 'Payment Received' : 'New Credit',
            transaction.amount.toFixed(2),
            transaction.balanceAfter?.toFixed(2) || 'N/A',
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
        showNotification('Transaction history exported successfully', 'success');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter customers based on search
    const filteredCustomers = customers.filter(customer =>
        customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phoneNumber && customer.phoneNumber.includes(searchTerm))
    );

    // Calculate statistics
    const totalCustomers = customers.length;
    const totalReceivable = customers.reduce((sum, c) => c.remainingBalance > 0 ? sum + c.remainingBalance : sum, 0);
    const totalPayable = customers.reduce((sum, c) => c.remainingBalance < 0 ? sum + Math.abs(c.remainingBalance) : sum, 0);
    const netBalance = totalReceivable - totalPayable;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg animate-slide-in ${notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    } text-white`}>
                    {notification.type === 'success' ? <FiCheckCircle className="text-xl" /> :
                        notification.type === 'warning' ? <FiAlertCircle className="text-xl" /> : <FiRefreshCw className="text-xl" />}
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <FiUsers className="text-white text-2xl" />
                        </div>
                        Khata Management System
                    </h1>
                    <p className="text-gray-600 mt-2 ml-2">Manage customer credits, debits, and transactions</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Customers</p>
                                <p className="text-2xl font-bold text-gray-800">{totalCustomers}</p>
                            </div>
                            <FiUsers className="text-blue-500 text-3xl opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Receivable</p>
                                <p className="text-2xl font-bold text-green-600">Rs. {totalReceivable.toFixed(2)}</p>
                            </div>
                            <FiTrendingUp className="text-green-500 text-3xl opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Payable</p>
                                <p className="text-2xl font-bold text-red-600">Rs. {totalPayable.toFixed(2)}</p>
                            </div>
                            <FiTrendingDown className="text-red-500 text-3xl opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Net Balance</p>
                                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Rs. {netBalance.toFixed(2)}
                                </p>
                            </div>
                            <FiDollarSign className="text-purple-500 text-3xl opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Add Khata Form */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FiUserPlus className="text-blue-600" />
                        Add New Khata
                    </h2>

                    <form onSubmit={addCustomer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Positive = Customer owes you | Negative = You owe customer
                            </p>
                        </div>

                        <div className="md:col-span-3">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                <FiUserPlus className="text-xl" />
                                Save Khata
                            </button>
                        </div>
                    </form>
                    <ToastContainer />
                </div>

                {/* Filters and Actions */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4 flex-1">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px]">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleExportCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                <FiDownload />
                                Export CSV
                            </button>
                            <button
                                onClick={fetchKhatas}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                <FiRefreshCw />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Khata Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone Number
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Opening Balance
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Remaining Balance
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No khata records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer._id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{customer.customerName}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {customer.phoneNumber || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                Rs. {customer.openingBalance?.toFixed(2) || "0.00"}
                                            </td>
                                            <td className={`px-6 py-4 text-sm font-bold ${customer.remainingBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                Rs. {customer.remainingBalance?.toFixed(2) || "0.00"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {customer.remainingBalance >= 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                        <FiTrendingUp className="text-xs" />
                                                        You Will Receive
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                                        <FiTrendingDown className="text-xs" />
                                                        You Will Pay
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openHistoryModal(customer)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        title="View Transaction History"
                                                    >
                                                        <FiClock />
                                                    </button>
                                                    <button
                                                        onClick={() => openTransactionModal(customer)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                        title="Add Transaction"
                                                    >
                                                        <FiPlus />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(customer)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit Customer"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCustomer(customer);
                                                            setShowDeleteConfirm(true);
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete Customer"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Transaction History Modal */}
            {showHistoryModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FiClock className="text-indigo-600" />
                                    Transaction History
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedCustomer.customerName} - {selectedCustomer.phoneNumber || "No phone"}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => exportCustomerTransactions(selectedCustomer)}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                >
                                    <FiDownload />
                                    Export
                                </button>
                                <button
                                    onClick={() => setShowHistoryModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FiX className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Balance Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600">Opening Balance</p>
                                <p className="text-lg font-bold text-blue-600">Rs. {selectedCustomer.openingBalance?.toFixed(2)}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600">Current Balance</p>
                                <p className={`text-lg font-bold ${selectedCustomer.remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Rs. {selectedCustomer.remainingBalance?.toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600">Total Transactions</p>
                                <p className="text-lg font-bold text-gray-700">{selectedCustomer.transactions?.length || 0}</p>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        {selectedCustomer.transactions && selectedCustomer.transactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date & Time
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Balance After
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Note
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {[...(selectedCustomer.transactions || [])].reverse().map((transaction, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <FiCalendar className="text-xs" />
                                                        {formatDate(transaction.date)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {transaction.type === "payment" ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                            <FiMinus className="text-xs" />
                                                            Payment Received
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                                            <FiPlus className="text-xs" />
                                                            New Credit
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`px-4 py-3 text-right text-sm font-semibold ${transaction.type === "payment" ? "text-green-600" : "text-red-600"}`}>
                                                    {transaction.type === "payment" ? "-" : "+"} Rs. {transaction.amount?.toFixed(2) || "N/A"}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-700">
                                                    Rs. {transaction.balanceAfter?.toFixed(2) || "N/A"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {transaction.note ? (
                                                        <div className="flex items-center gap-1">
                                                            <FiInfo className="text-xs text-gray-400" />
                                                            {transaction.note}
                                                        </div>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FiList className="text-gray-300 text-5xl mx-auto mb-3" />
                                <p className="text-gray-500">No transactions found for this customer</p>
                                <button
                                    onClick={() => {
                                        setShowHistoryModal(false);
                                        openTransactionModal(selectedCustomer);
                                    }}
                                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                >
                                    <FiPlus />
                                    Add First Transaction
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Customer Modal */}
            {showEditModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Edit Customer</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={editForm.customerName}
                                    onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={editForm.phoneNumber}
                                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleEditCustomer}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                <FiSave />
                                Save Changes
                            </button>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Modal */}
            {showTransactionModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Add Transaction</h3>
                            <button onClick={() => setShowTransactionModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">
                                    Customer: <span className="font-semibold">{selectedCustomer.customerName}</span>
                                </p>
                                <p className={`text-sm font-semibold mb-4 ${selectedCustomer.remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Current Balance: Rs. {selectedCustomer.remainingBalance?.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction Type
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            value="payment"
                                            checked={transactionType === "payment"}
                                            onChange={(e) => setTransactionType(e.target.value)}
                                            className="text-blue-600"
                                        />
                                        <span className="flex items-center gap-1">
                                            <FiMinus className="text-red-500" />
                                            Payment Received
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            value="credit"
                                            checked={transactionType === "credit"}
                                            onChange={(e) => setTransactionType(e.target.value)}
                                            className="text-blue-600"
                                        />
                                        <span className="flex items-center gap-1">
                                            <FiPlus className="text-green-500" />
                                            New Credit
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount (Rs.)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={transactionAmount}
                                    onChange={(e) => setTransactionAmount(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Note (Optional)
                                </label>
                                <textarea
                                    value={transactionNote}
                                    onChange={(e) => setTransactionNote(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Add a note about this transaction..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleTransaction}
                                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                            >
                                <FiSave />
                                Save Transaction
                            </button>
                            <button
                                onClick={() => setShowTransactionModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <FiAlertCircle className="text-red-600 text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Customer</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to delete <span className="font-semibold">{selectedCustomer.customerName}</span>?
                                This will remove all their khata records and cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteCustomer}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
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
                
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
                
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Khata;