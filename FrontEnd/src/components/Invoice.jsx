import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../components/SettingContext";
import {
    FiUser, FiPhone, FiPackage, FiDollarSign, FiHash, FiPlus,
    FiTrash2, FiPrinter, FiCheckCircle, FiSave, FiEdit2, FiSearch,
    FiX, FiToggleLeft, FiToggleRight, FiTag, FiClock, FiEye, FiRefreshCw, FiList
} from "react-icons/fi";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";

const Invoice = () => {
    const { settings, loading: settingsLoading } = useSettings();
    const [customer, setCustomer] = useState({
        name: "",
        phone: "",
        email: "",
        address: ""
    });

    const [item, setItem] = useState({
        product: "",
        price: "",
        qty: ""
    });

    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(0);
    const [notes, setNotes] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`);
    const [errors, setErrors] = useState({});
    const [products, setProducts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [pricingType, setPricingType] = useState("retail");
    const [showHistory, setShowHistory] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const invoiceRef = useRef();
    const searchInputRef = useRef();

    const API_URL = "http://localhost:8080";

    // Get current user from localStorage
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setCurrentUser(user);
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchProducts();
            fetchInvoices();
        }
    }, [currentUser]);

    const fetchProducts = async () => {
        try {
            setLoadingProducts(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/products`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok) {
                const formattedProducts = result.data.map((product) => ({
                    id: product._id,
                    name: product.name,
                    purchasePrice: product.purchasePrice || 0,
                    wholesalePrice: product.wholesalePrice || product.price || 0,
                    retailPrice: product.retailPrice || product.price || 0,
                    stock: product.quantity,
                    category: product.category,
                    sku: product._id.slice(-6).toUpperCase()
                }));
                setProducts(formattedProducts);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            handleError("Failed to load products");
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchInvoices = async () => {
        try {
            setLoadingInvoices(true);

            const token = localStorage.getItem("token");

            const response = await fetch(`${API_URL}/invoices`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Invoices from backend:", result.data);

                // ❌ NO FILTERING HERE (backend already isolates user)
                setInvoices(result.data);
            } else {
                handleError(result.message || "Failed to load invoices");
            }

        } catch (error) {
            console.error("Error fetching invoices:", error);
            handleError("Failed to load invoices");
        } finally {
            setLoadingInvoices(false);
        }
    };

    const handleCustomer = (e) => {
        setCustomer({
            ...customer,
            [e.target.name]: e.target.value
        });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const handleItem = (e) => {
        const { name, value } = e.target;
        setItem({
            ...item,
            [name]: value
        });

        if (name === 'product') {
            if (value.length > 0) {
                const results = products.filter(product =>
                    product.name.toLowerCase().includes(value.toLowerCase()) ||
                    product.sku.toLowerCase().includes(value.toLowerCase())
                );
                setSearchResults(results);
                setShowSearchDropdown(true);
            } else {
                setSearchResults([]);
                setShowSearchDropdown(false);
            }
        }
    };

    const selectProduct = (selectedProduct) => {
        const price = pricingType === "retail" ? selectedProduct.retailPrice : selectedProduct.wholesalePrice;
        setItem({
            product: selectedProduct.name,
            price: price.toString(),
            qty: item.qty || "1"
        });
        setSearchResults([]);
        setShowSearchDropdown(false);

        if (errors.product) {
            setErrors({ ...errors, product: "" });
        }
    };

    const validateItem = () => {
        const newErrors = {};
        if (!item.product.trim()) newErrors.product = "Product name required";
        if (!item.price || item.price <= 0) newErrors.price = "Valid price required";
        if (!item.qty || item.qty <= 0) newErrors.qty = "Valid quantity required";

        const selectedProduct = products.find(p => p.name.toLowerCase() === item.product.toLowerCase());
        if (selectedProduct && parseInt(item.qty) > selectedProduct.stock) {
            newErrors.qty = `Only ${selectedProduct.stock} units available in stock`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addItem = () => {
        if (!validateItem()) return;

        const existingItem = items.find(i => i.product.toLowerCase() === item.product.toLowerCase());
        if (existingItem) {
            const newQty = existingItem.qty + parseFloat(item.qty);
            const selectedProduct = products.find(p => p.name.toLowerCase() === item.product.toLowerCase());

            if (selectedProduct && newQty > selectedProduct.stock) {
                handleError(`Cannot add more. Only ${selectedProduct.stock} units available in stock`);
                return;
            }

            updateItem(existingItem.id, 'qty', newQty);
            setItem({ product: "", price: "", qty: "" });
            return;
        }

        setItems([
            ...items,
            {
                id: Date.now(),
                ...item,
                price: parseFloat(item.price),
                qty: parseFloat(item.qty),
                total: parseFloat(item.price) * parseFloat(item.qty),
                pricingType: pricingType
            }
        ]);

        setItem({
            product: "",
            price: "",
            qty: ""
        });
        setSearchResults([]);
        setShowSearchDropdown(false);
        handleSuccess("Item added successfully");
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id, field, value) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'price' || field === 'qty') {
                    updatedItem.total = parseFloat(updatedItem.price) * parseFloat(updatedItem.qty);
                }

                if (field === 'qty') {
                    const selectedProduct = products.find(p => p.name.toLowerCase() === updatedItem.product.toLowerCase());
                    if (selectedProduct && parseFloat(value) > selectedProduct.stock) {
                        handleError(`Only ${selectedProduct.stock} units available in stock`);
                        return item;
                    }
                }

                return updatedItem;
            }
            return item;
        }));
    };

    const updatePricingType = (type) => {
        setPricingType(type);

        const updatedItems = items.map(item => {
            const product = products.find(p => p.name.toLowerCase() === item.product.toLowerCase());
            if (product) {
                const newPrice = type === "retail" ? product.retailPrice : product.wholesalePrice;
                return {
                    ...item,
                    price: newPrice,
                    total: newPrice * item.qty
                };
            }
            return item;
        });

        setItems(updatedItems);

        if (item.product) {
            const currentProduct = products.find(p => p.name.toLowerCase() === item.product.toLowerCase());
            if (currentProduct) {
                const newPrice = type === "retail" ? currentProduct.retailPrice : currentProduct.wholesalePrice;
                setItem(prev => ({
                    ...prev,
                    price: newPrice.toString()
                }));
            }
        }

        handleSuccess(`Switched to ${type === "retail" ? "Retail" : "Wholesale"} pricing`);
    };

    const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * tax) / 100;
    const grandTotal = subtotal - discountAmount + taxAmount;

    const generateInvoice = async () => {
        if (!customer.name || items.length === 0) {
            handleError("Please add customer name and at least one item!");
            return;
        }

        const token = localStorage.getItem("token");

        const invoiceData = {
            invoiceNumber,
            date: new Date().toISOString(),
            customer,
            items: items.map(({ id, ...rest }) => rest),
            pricingType,
            subtotal,
            discount,
            discountAmount,
            tax,
            taxAmount,
            grandTotal,
            notes
            
        };

        try {
            const response = await fetch(`${API_URL}/invoices`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(invoiceData)
            });

            const result = await response.json();

            if (response.ok) {
                handleSuccess("Invoice Generated Successfully!");
                await fetchInvoices();
                resetForm();
            } else {
                handleError(result.message || "Failed to generate invoice");
            }

        } catch (error) {
            console.error(error);
            handleError("Failed to save invoice");
        }
    };

    const printInvoice = (invoice = null) => {
        const invoiceToPrint = invoice || {
            invoiceNumber,
            date: new Date().toISOString(),
            customer,
            items,
            pricingType,
            subtotal,
            discount,
            discountAmount,
            tax,
            taxAmount,
            grandTotal,
            notes
        };

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
        <html>
            <head>
                <title>Invoice ${invoiceToPrint.invoiceNumber}</title>
                <style>
                    body { 
                        font-family: 'Arial', sans-serif; 
                        padding: 40px; 
                        margin: 0;
                        color: #333;
                    }
                    .invoice-container {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                    }
                    .invoice-header { 
                        text-align: center; 
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #e5e7eb;
                    }
                    .company-name { 
                        font-size: 28px; 
                        font-weight: bold; 
                        color: #2563eb;
                        margin-bottom: 8px;
                    }
                    .company-details {
                        color: #6b7280;
                        font-size: 12px;
                        line-height: 1.5;
                    }
                    .invoice-title { 
                        font-size: 24px; 
                        margin: 20px 0;
                        text-align: center;
                    }
                    .invoice-meta {
                        display: flex;
                        justify-content: space-between;
                        margin: 20px 0;
                        padding: 10px 0;
                    }
                    .customer-info { 
                        margin: 20px 0; 
                        padding: 15px; 
                        background: #f3f4f6; 
                        border-radius: 8px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 20px 0; 
                    }
                    th, td { 
                        padding: 12px; 
                        text-align: left; 
                        border-bottom: 1px solid #e5e7eb; 
                    }
                    th { 
                        background: #f3f4f6; 
                        font-weight: bold; 
                    }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .totals { 
                        text-align: right; 
                        margin-top: 20px;
                        padding-top: 20px;
                        border-top: 2px solid #e5e7eb;
                    }
                    .grand-total { 
                        font-size: 20px; 
                        font-weight: bold; 
                        color: #2563eb; 
                        margin-top: 10px;
                    }
                    .pricing-badge { 
                        display: inline-block; 
                        padding: 4px 12px; 
                        border-radius: 4px; 
                        font-size: 12px; 
                        font-weight: bold; 
                        margin-left: 10px;
                    }
                    .retail-badge { 
                        background: #dbeafe; 
                        color: #1e40af; 
                    }
                    .wholesale-badge { 
                        background: #fef3c7; 
                        color: #92400e; 
                    }
                    .footer {
                        margin-top: 50px;
                        text-align: center;
                        color: #6b7280;
                        font-size: 12px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                    }
                    @media print {
                        button { display: none; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <div class="invoice-header">
                        <div class="company-name">${settings.companyName}</div>
                        <div class="company-details">
                            ${settings.companyAddress}<br/>
                            Phone: ${settings.companyPhone} | Email: ${settings.companyEmail}
                        </div>
                    </div>
                    <div class="invoice-title">
                        INVOICE
                        <span class="pricing-badge ${invoiceToPrint.pricingType === 'retail' ? 'retail-badge' : 'wholesale-badge'}">
                            ${invoiceToPrint.pricingType === 'retail' ? 'RETAIL PRICES' : 'WHOLESALE PRICES'}
                        </span>
                    </div>
                    <div class="invoice-meta">
                        <div><strong>Invoice #:</strong> ${invoiceToPrint.invoiceNumber}</div>
                        <div><strong>Date:</strong> ${new Date(invoiceToPrint.date).toLocaleString()}</div>
                    </div>
                    <div class="customer-info">
                        <strong>Bill To:</strong><br/>
                        ${invoiceToPrint.customer.name}<br/>
                        ${invoiceToPrint.customer.phone || ''}<br/>
                        ${invoiceToPrint.customer.email || ''}<br/>
                        ${invoiceToPrint.customer.address || ''}
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th class="text-right">Price</th>
                                <th class="text-center">Qty</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoiceToPrint.items.map(item => `
                                <tr>
                                    <td>${item.product}${item.pricingType ? `<span style="font-size:10px; margin-left:8px;">(${item.pricingType})</span>` : ''}</td>
                                    <td class="text-right">${settings.currency} ${item.price.toFixed(2)}</td>
                                    <td class="text-center">${item.qty}</td>
                                    <td class="text-right">${settings.currency} ${item.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="totals">
                        <div>Subtotal: ${settings.currency} ${invoiceToPrint.subtotal.toFixed(2)}</div>
                        ${invoiceToPrint.discount > 0 ? `<div>Discount (${invoiceToPrint.discount}%): -${settings.currency} ${invoiceToPrint.discountAmount.toFixed(2)}</div>` : ''}
                        ${invoiceToPrint.tax > 0 ? `<div>Tax (${invoiceToPrint.tax}%): +${settings.currency} ${invoiceToPrint.taxAmount.toFixed(2)}</div>` : ''}
                        <div class="grand-total">Grand Total: ${settings.currency} ${invoiceToPrint.grandTotal.toFixed(2)}</div>
                    </div>
                    ${invoiceToPrint.notes ? `
                        <div style="margin-top: 30px;">
                            <strong>Notes:</strong><br/>
                            <p style="margin-top: 5px;">${invoiceToPrint.notes}</p>
                        </div>
                    ` : ''}
                    <div class="footer">
                        ${settings.invoiceFooter}
                    </div>
                </div>
            </body>
        </html>
    `);
        printWindow.print();
        printWindow.close();
    };

    const resetForm = () => {
        setCustomer({ name: "", phone: "", email: "", address: "" });
        setItems([]);
        setDiscount(0);
        setTax(0);
        setNotes("");
        setInvoiceNumber(`INV-${Date.now()}`);
        setItem({ product: "", price: "", qty: "" });
        setSearchResults([]);
        setShowSearchDropdown(false);
        setPricingType("retail");
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

    // Animation variants
    const cardVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.3 }
    };

    const itemVariants = {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
        transition: { duration: 0.2 }
    };

    if (settingsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-3">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header with dynamic company name */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex justify-between items-center"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.3 }}
                                className="bg-blue-600 p-2 rounded-xl"
                            >
                                <FiPackage className="text-white text-2xl" />
                            </motion.div>
                            Invoice Generator
                        </h1>
                        <p className="text-gray-600 mt-2 ml-2">{settings.companyName} - Create professional invoices with product search from stock</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setShowHistory(!showHistory);
                            if (!showHistory) fetchInvoices();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
                    >
                        <FiClock />
                        {showHistory ? "New Invoice" : "Invoice History"}
                    </motion.button>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!showHistory ? (
                        <motion.div
                            key="invoice-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Pricing Type Toggle */}
                            <motion.div
                                variants={cardVariants}
                                initial="initial"
                                animate="animate"
                                className="bg-white rounded-xl shadow-md p-4 mb-6"
                            >
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-3">
                                        <FiTag className="text-gray-400 text-xl" />
                                        <span className="font-medium text-gray-700">Pricing Mode:</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => updatePricingType("retail")}
                                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${pricingType === "retail"
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                        >
                                            {pricingType === "retail" ? <FiToggleRight className="text-xl" /> : <FiToggleLeft className="text-xl" />}
                                            Retail Pricing
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => updatePricingType("wholesale")}
                                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${pricingType === "wholesale"
                                                ? "bg-orange-600 text-white shadow-md"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                        >
                                            {pricingType === "wholesale" ? <FiToggleRight className="text-xl" /> : <FiToggleLeft className="text-xl" />}
                                            Wholesale Pricing
                                        </motion.button>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {pricingType === "retail" ? (
                                            <span className="text-blue-600">✓ Using retail prices for all items</span>
                                        ) : (
                                            <span className="text-orange-600">✓ Using wholesale prices for all items</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Left Column - Forms */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Customer Info */}
                                    <motion.div
                                        variants={cardVariants}
                                        initial="initial"
                                        animate="animate"
                                        transition={{ delay: 0.1 }}
                                        className="bg-white rounded-xl shadow-md overflow-hidden"
                                    >
                                        <motion.div
                                            initial={{ x: -100 }}
                                            animate={{ x: 0 }}
                                            className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4"
                                        >
                                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <FiUser />
                                                Customer Information
                                            </h2>
                                        </motion.div>
                                        <div className="p-6 grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Customer Name *
                                                </label>
                                                <div className="relative">
                                                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        placeholder="Enter customer name"
                                                        value={customer.name}
                                                        onChange={handleCustomer}
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
                                                        name="phone"
                                                        placeholder="+92 XXX XXXXXXX"
                                                        value={customer.phone}
                                                        onChange={handleCustomer}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="customer@example.com"
                                                    value={customer.email}
                                                    onChange={handleCustomer}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    placeholder="Customer address"
                                                    value={customer.address}
                                                    onChange={handleCustomer}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Add Items with Search */}
                                    <motion.div
                                        variants={cardVariants}
                                        initial="initial"
                                        animate="animate"
                                        transition={{ delay: 0.2 }}
                                        className="bg-white rounded-xl shadow-md overflow-hidden"
                                    >
                                        <motion.div
                                            initial={{ x: -100 }}
                                            animate={{ x: 0 }}
                                            className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4"
                                        >
                                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <FiPackage />
                                                Add Items
                                            </h2>
                                        </motion.div>
                                        <div className="p-6">
                                            <div className="flex flex-wrap gap-4 mb-4 items-end">
                                                <div className="flex-1 relative">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Product Name
                                                    </label>
                                                    <div className="relative">
                                                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            ref={searchInputRef}
                                                            type="text"
                                                            name="product"
                                                            placeholder="Search product by name or SKU..."
                                                            value={item.product}
                                                            onChange={handleItem}
                                                            onFocus={() => item.product && setShowSearchDropdown(true)}
                                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.product ? 'border-red-500' : 'border-gray-300'
                                                                }`}
                                                        />
                                                        {item.product && showSearchDropdown && (
                                                            <button
                                                                onClick={() => setShowSearchDropdown(false)}
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                            >
                                                                <FiX />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <AnimatePresence>
                                                        {showSearchDropdown && searchResults.length > 0 && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                                            >
                                                                {searchResults.map((product, idx) => (
                                                                    <motion.div
                                                                        key={product.id}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: idx * 0.05 }}
                                                                        onClick={() => selectProduct(product)}
                                                                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <div>
                                                                                <div className="font-medium text-gray-800">{product.name}</div>
                                                                                <div className="text-xs text-gray-500">
                                                                                    SKU: {product.sku} | Stock: {product.stock} units
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                {pricingType === "retail" ? (
                                                                                    <>
                                                                                        <div className="font-semibold text-blue-600">
                                                                                            {settings.currency} {product.retailPrice}
                                                                                        </div>
                                                                                        {product.wholesalePrice > 0 && (
                                                                                            <div className="text-xs text-gray-500 line-through">
                                                                                                Wholesale: {settings.currency} {product.wholesalePrice}
                                                                                            </div>
                                                                                        )}
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <div className="font-semibold text-orange-600">
                                                                                            {settings.currency} {product.wholesalePrice}
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-500 line-through">
                                                                                            Retail: {settings.currency} {product.retailPrice}
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {errors.product && <p className="mt-1 text-xs text-red-500">{errors.product}</p>}
                                                </div>

                                                <div className="flex-none w-32">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Price ({pricingType === "retail" ? "Retail" : "Wholesale"})
                                                    </label>
                                                    <div className="relative">
                                                        <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type="number"
                                                            name="price"
                                                            placeholder="0"
                                                            value={item.price}
                                                            onChange={handleItem}
                                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                                                                }`}
                                                        />
                                                    </div>
                                                    {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                                                </div>

                                                <div className="flex-none w-32">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Qty
                                                    </label>
                                                    <div className="relative">
                                                        <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type="number"
                                                            name="qty"
                                                            placeholder="1"
                                                            value={item.qty}
                                                            onChange={handleItem}
                                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.qty ? 'border-red-500' : 'border-gray-300'
                                                                }`}
                                                        />
                                                    </div>
                                                    {errors.qty && <p className="mt-1 text-xs text-red-500">{errors.qty}</p>}
                                                </div>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={addItem}
                                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                            >
                                                <FiPlus />
                                                Add Item to Invoice
                                            </motion.button>
                                        </div>
                                    </motion.div>

                                    {/* Invoice Settings */}
                                    <motion.div
                                        variants={cardVariants}
                                        initial="initial"
                                        animate="animate"
                                        transition={{ delay: 0.3 }}
                                        className="bg-white rounded-xl shadow-md overflow-hidden"
                                    >
                                        <motion.div
                                            initial={{ x: -100 }}
                                            animate={{ x: 0 }}
                                            className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4"
                                        >
                                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <FiEdit2 />
                                                Invoice Settings
                                            </h2>
                                        </motion.div>
                                        <div className="p-6 grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Discount (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={discount}
                                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tax (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={tax}
                                                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Notes / Terms
                                                </label>
                                                <textarea
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    rows="3"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Payment terms, thank you message, etc..."
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Right Column - Invoice Preview */}
                                <motion.div
                                    variants={cardVariants}
                                    initial="initial"
                                    animate="animate"
                                    transition={{ delay: 0.4 }}
                                    className="lg:col-span-1"
                                >
                                    <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
                                        <motion.div
                                            initial={{ x: 100 }}
                                            animate={{ x: 0 }}
                                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4"
                                        >
                                            <h2 className="text-lg font-semibold text-white flex items-center justify-between">
                                                <span>Invoice Preview</span>
                                                <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded">
                                                    {invoiceNumber}
                                                </span>
                                            </h2>
                                        </motion.div>

                                        <div className="p-6" ref={invoiceRef}>
                                            <div className="mb-4 pb-3 border-b">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${pricingType === "retail" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                                                    <FiTag className="text-xs" />
                                                    {pricingType === "retail" ? "RETAIL PRICES" : "WHOLESALE PRICES"}
                                                </div>
                                            </div>

                                            {items.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <FiPackage className="text-4xl mx-auto mb-2 opacity-50" />
                                                    <p>No items added yet</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="p-2 text-left">Product</th>
                                                                    <th className="p-2 text-right">Price</th>
                                                                    <th className="p-2 text-center">Qty</th>
                                                                    <th className="p-2 text-right">Total</th>
                                                                    <th className="p-2"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <AnimatePresence>
                                                                    {items.map((it, idx) => (
                                                                        <motion.tr
                                                                            key={it.id}
                                                                            variants={itemVariants}
                                                                            initial="initial"
                                                                            animate="animate"
                                                                            exit="exit"
                                                                            transition={{ delay: idx * 0.05 }}
                                                                            className="border-t"
                                                                        >
                                                                            <td className="p-2">
                                                                                <input
                                                                                    type="text"
                                                                                    value={it.product}
                                                                                    onChange={(e) => updateItem(it.id, 'product', e.target.value)}
                                                                                    className="w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                                />
                                                                            </td>
                                                                            <td className="p-2">
                                                                                <input
                                                                                    type="number"
                                                                                    value={it.price}
                                                                                    onChange={(e) => updateItem(it.id, 'price', parseFloat(e.target.value))}
                                                                                    className="w-20 p-1 text-right border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                                />
                                                                            </td>
                                                                            <td className="p-2 text-center">
                                                                                <input
                                                                                    type="number"
                                                                                    value={it.qty}
                                                                                    onChange={(e) => updateItem(it.id, 'qty', parseFloat(e.target.value))}
                                                                                    className="w-16 p-1 text-center border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                                />
                                                                            </td>
                                                                            <td className="p-2 text-right font-semibold">
                                                                                {settings.currency} {it.total.toFixed(2)}
                                                                            </td>
                                                                            <td className="p-2 text-center">
                                                                                <motion.button
                                                                                    whileHover={{ scale: 1.1 }}
                                                                                    whileTap={{ scale: 0.9 }}
                                                                                    onClick={() => removeItem(it.id)}
                                                                                    className="text-red-600 hover:text-red-800"
                                                                                >
                                                                                    <FiTrash2 />
                                                                                </motion.button>
                                                                            </td>
                                                                        </motion.tr>
                                                                    ))}
                                                                </AnimatePresence>
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t">
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span>Subtotal:</span>
                                                                <span>{settings.currency} {subtotal.toFixed(2)}</span>
                                                            </div>
                                                            {discount > 0 && (
                                                                <div className="flex justify-between text-green-600">
                                                                    <span>Discount ({discount}%):</span>
                                                                    <span>-{settings.currency} {discountAmount.toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                            {tax > 0 && (
                                                                <div className="flex justify-between text-orange-600">
                                                                    <span>Tax ({tax}%):</span>
                                                                    <span>+{settings.currency} {taxAmount.toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                                                <span>Grand Total:</span>
                                                                <span className="text-blue-600">{settings.currency} {grandTotal.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="p-6 pt-0 space-y-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={generateInvoice}
                                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2 shadow-lg"
                                            >
                                                <FiCheckCircle />
                                                Generate Invoice
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => printInvoice()}
                                                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
                                            >
                                                <FiPrinter />
                                                Print Preview
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={resetForm}
                                                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                                            >
                                                Reset All
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        // Invoice History Section
                        <motion.div
                            key="invoice-history"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-xl shadow-md overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <FiClock />
                                    Invoice History
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchInvoices}
                                    className="flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
                                >
                                    <FiRefreshCw />
                                    Refresh
                                </motion.button>
                            </div>

                            <div className="p-6">
                                {loadingInvoices ? (
                                    <div className="text-center py-12">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
                                        />
                                        <p className="text-gray-500 mt-3">Loading invoices...</p>
                                    </div>
                                ) : invoices.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FiList className="text-gray-300 text-5xl mx-auto mb-3" />
                                        <p className="text-gray-500">No invoices found</p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowHistory(false)}
                                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            <FiPackage />
                                            Create First Invoice
                                        </motion.button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Invoice #
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Customer
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Amount
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Type
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                <AnimatePresence>
                                                    {invoices.map((invoice, idx) => (
                                                        <motion.tr
                                                            key={invoice._id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 20 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            whileHover={{ backgroundColor: '#F9FAFB' }}
                                                            className="transition"
                                                        >
                                                            <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900">
                                                                {invoice.invoiceNumber}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="font-medium text-gray-900">{invoice.customer.name}</div>
                                                                {invoice.customer.phone && (
                                                                    <div className="text-xs text-gray-500">{invoice.customer.phone}</div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                {formatDate(invoice.date)}
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                                {settings.currency} {invoice.grandTotal.toFixed(2)}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${invoice.pricingType === "retail" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                                                                    <FiTag className="text-xs" />
                                                                    {invoice.pricingType === "retail" ? "Retail" : "Wholesale"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex gap-2 justify-center">
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => {
                                                                            setSelectedInvoice(invoice);
                                                                            setShowInvoiceDetail(true);
                                                                        }}
                                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                                        title="View Invoice"
                                                                    >
                                                                        <FiEye />
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => printInvoice(invoice)}
                                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                                        title="Print Invoice"
                                                                    >
                                                                        <FiPrinter />
                                                                    </motion.button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Invoice Detail Modal */}
            <AnimatePresence>
                {showInvoiceDetail && selectedInvoice && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FiPackage className="text-indigo-600" />
                                    Invoice Details
                                </h3>
                                <motion.button
                                    whileHover={{ rotate: 90 }}
                                    onClick={() => setShowInvoiceDetail(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FiX className="text-xl" />
                                </motion.button>
                            </div>

                            <div className="border rounded-lg p-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-blue-600">{settings.companyName}</h2>
                                    <p className="text-gray-500">{settings.companyAddress}</p>
                                    <p className="text-gray-500 text-sm">Phone: {settings.companyPhone} | Email: {settings.companyEmail}</p>
                                    <div className="mt-4">
                                        <h3 className="text-xl font-bold">INVOICE</h3>
                                        <p className="text-sm">#{selectedInvoice.invoiceNumber}</p>
                                        <p className="text-sm">Date: {formatDate(selectedInvoice.date)}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <h4 className="font-semibold mb-2">Bill To:</h4>
                                    <p className="font-medium">{selectedInvoice.customer.name}</p>
                                    {selectedInvoice.customer.phone && <p className="text-sm">{selectedInvoice.customer.phone}</p>}
                                    {selectedInvoice.customer.email && <p className="text-sm">{selectedInvoice.customer.email}</p>}
                                    {selectedInvoice.customer.address && <p className="text-sm">{selectedInvoice.customer.address}</p>}
                                </div>

                                <table className="w-full mb-6">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left">Product</th>
                                            <th className="p-3 text-right">Price</th>
                                            <th className="p-3 text-center">Qty</th>
                                            <th className="p-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.items.map((item, idx) => (
                                            <tr key={idx} className="border-b">
                                                <td className="p-3">{item.product}</td>
                                                <td className="p-3 text-right">{settings.currency} {item.price.toFixed(2)}</td>
                                                <td className="p-3 text-center">{item.qty}</td>
                                                <td className="p-3 text-right font-semibold">{settings.currency} {item.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="text-right space-y-2">
                                    <p>Subtotal: {settings.currency} {selectedInvoice.subtotal.toFixed(2)}</p>
                                    {selectedInvoice.discount > 0 && (
                                        <p className="text-green-600">Discount ({selectedInvoice.discount}%): -{settings.currency} {selectedInvoice.discountAmount.toFixed(2)}</p>
                                    )}
                                    {selectedInvoice.tax > 0 && (
                                        <p className="text-orange-600">Tax ({selectedInvoice.tax}%): +{settings.currency} {selectedInvoice.taxAmount.toFixed(2)}</p>
                                    )}
                                    <p className="text-xl font-bold text-blue-600">Grand Total: {settings.currency} {selectedInvoice.grandTotal.toFixed(2)}</p>
                                </div>

                                {selectedInvoice.notes && (
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <p className="font-semibold mb-1">Notes:</p>
                                        <p className="text-sm">{selectedInvoice.notes}</p>
                                    </div>
                                )}

                                <div className="mt-6 pt-4 border-t text-center text-gray-500 text-sm">
                                    {settings.invoiceFooter}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => printInvoice(selectedInvoice)}
                                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
                                >
                                    <FiPrinter />
                                    Print Invoice
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowInvoiceDetail(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ToastContainer />
        </motion.div>
    );
};

export default Invoice;