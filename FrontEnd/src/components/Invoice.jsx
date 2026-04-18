import React, { useState, useRef } from "react";
import {
    FiUser,
    FiPhone,
    FiPackage,
    FiDollarSign,
    FiHash,
    FiPlus,
    FiTrash2,
    FiPrinter,
    FiDownload,
    FiMail,
    FiShare2,
    FiCheckCircle,
    FiAlertCircle,
    FiSave,
    FiEdit2
} from "react-icons/fi";

const Invoice = () => {
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
    const [showPreview, setShowPreview] = useState(false);
    const [errors, setErrors] = useState({});
    const invoiceRef = useRef();

    const handleCustomer = (e) => {
        setCustomer({
            ...customer,
            [e.target.name]: e.target.value
        });
        // Clear error for this field
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const handleItem = (e) => {
        setItem({
            ...item,
            [e.target.name]: e.target.value
        });
    };

    const validateItem = () => {
        const newErrors = {};
        if (!item.product.trim()) newErrors.product = "Product name required";
        if (!item.price || item.price <= 0) newErrors.price = "Valid price required";
        if (!item.qty || item.qty <= 0) newErrors.qty = "Valid quantity required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addItem = () => {
        if (!validateItem()) return;

        setItems([
            ...items,
            {
                id: Date.now(),
                ...item,
                price: parseFloat(item.price),
                qty: parseFloat(item.qty),
                total: parseFloat(item.price) * parseFloat(item.qty)
            }
        ]);

        setItem({
            product: "",
            price: "",
            qty: ""
        });
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
                return updatedItem;
            }
            return item;
        }));
    };

    const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * tax) / 100;
    const grandTotal = subtotal - discountAmount + taxAmount;

    const generateInvoice = () => {
        if (!customer.name || items.length === 0) {
            alert("Please add customer name and at least one item!");
            return;
        }

        const invoiceData = {
            invoiceNumber,
            date: new Date().toLocaleString(),
            customer,
            items,
            subtotal,
            discount,
            discountAmount,
            tax,
            taxAmount,
            grandTotal,
            notes
        };

        console.log("Invoice Data:", invoiceData);
        alert("✅ Invoice Generated Successfully!");

        // Optional: Save to localStorage
        localStorage.setItem(`invoice_${invoiceNumber}`, JSON.stringify(invoiceData));
    };

    const printInvoice = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice ${invoiceNumber}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        .invoice-header { text-align: center; margin-bottom: 30px; }
                        .company-name { font-size: 28px; font-weight: bold; color: #2563eb; }
                        .invoice-title { font-size: 24px; margin: 20px 0; }
                        .customer-info { margin: 20px 0; padding: 15px; background: #f3f4f6; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                        th { background: #f3f4f6; font-weight: bold; }
                        .totals { text-align: right; margin-top: 20px; }
                        .grand-total { font-size: 20px; font-weight: bold; color: #2563eb; }
                        @media print {
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice-header">
                        <div class="company-name">Your Company Name</div>
                        <div>123 Business Street, City, Country</div>
                        <div>Phone: +92 XXX XXXXXXX | Email: info@company.com</div>
                    </div>
                    <div class="invoice-title">INVOICE</div>
                    <div>Invoice #: ${invoiceNumber}</div>
                    <div>Date: ${new Date().toLocaleString()}</div>
                    <div class="customer-info">
                        <strong>Bill To:</strong><br/>
                        ${customer.name}<br/>
                        ${customer.phone}<br/>
                        ${customer.email || ''}<br/>
                        ${customer.address || ''}
                    </div>
                    <table>
                        <thead>
                            <tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td>${item.product}</td>
                                    <td>Rs ${item.price}</td>
                                    <td>${item.qty}</td>
                                    <td>Rs ${item.total}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="totals">
                        <div>Subtotal: Rs ${subtotal.toFixed(2)}</div>
                        ${discount > 0 ? `<div>Discount (${discount}%): -Rs ${discountAmount.toFixed(2)}</div>` : ''}
                        ${tax > 0 ? `<div>Tax (${tax}%): +Rs ${taxAmount.toFixed(2)}</div>` : ''}
                        <div class="grand-total">Grand Total: Rs ${grandTotal.toFixed(2)}</div>
                    </div>
                    ${notes ? `<div style="margin-top: 30px;"><strong>Notes:</strong><br/>${notes}</div>` : ''}
                    <div style="margin-top: 50px; text-align: center; color: #6b7280;">
                        Thank you for your business!
                    </div>
                </body>
            </html>
        `);
        printWindow.print();
        printWindow.close();
    };

    const downloadInvoice = () => {
        const invoiceData = {
            invoiceNumber,
            date: new Date().toISOString(),
            customer,
            items,
            subtotal,
            discount,
            discountAmount,
            tax,
            taxAmount,
            grandTotal,
            notes
        };

        const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${invoiceNumber}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert("Invoice data downloaded!");
    };

    const resetForm = () => {
        if (window.confirm("Are you sure you want to reset everything?")) {
            setCustomer({ name: "", phone: "", email: "", address: "" });
            setItems([]);
            setDiscount(0);
            setTax(0);
            setNotes("");
            setInvoiceNumber(`INV-${Date.now()}`);
            setItem({ product: "", price: "", qty: "" });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <FiPackage className="text-white text-2xl" />
                        </div>
                        Invoice Generator
                    </h1>
                    <p className="text-gray-600 mt-2 ml-2">Create professional invoices quickly and easily</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <FiUser />
                                    Customer Information
                                </h2>
                            </div>
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
                        </div>

                        {/* Add Items */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <FiPackage />
                                    Add Items
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-wrap gap-4 mb-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Name
                                        </label>
                                        <div className="relative">
                                            <FiPackage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                name="product"
                                                placeholder="Enter product name"
                                                value={item.product}
                                                onChange={handleItem}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.product ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            />
                                        </div>
                                        {errors.product && <p className="mt-1 text-xs text-red-500">{errors.product}</p>}
                                    </div>

                                    <div className="flex-none w-32">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price
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
                                <button
                                    onClick={addItem}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    <FiPlus />
                                    Add Item to Invoice
                                </button>
                            </div>
                        </div>

                        {/* Invoice Settings */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <FiEdit2 />
                                    Invoice Settings
                                </h2>
                            </div>
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
                        </div>
                    </div>

                    {/* Right Column - Invoice Preview */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                                <h2 className="text-lg font-semibold text-white flex items-center justify-between">
                                    <span>Invoice Preview</span>
                                    <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded">
                                        {invoiceNumber}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6" ref={invoiceRef}>
                                {/* Items Table */}
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
                                                    {items.map((it) => (
                                                        <tr key={it.id} className="border-t">
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
                                                                Rs {it.total.toFixed(2)}
                                                            </td>
                                                            <td className="p-2 text-center">
                                                                <button
                                                                    onClick={() => removeItem(it.id)}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    <FiTrash2 />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Totals */}
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Subtotal:</span>
                                                    <span>Rs {subtotal.toFixed(2)}</span>
                                                </div>
                                                {discount > 0 && (
                                                    <div className="flex justify-between text-green-600">
                                                        <span>Discount ({discount}%):</span>
                                                        <span>-Rs {discountAmount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {tax > 0 && (
                                                    <div className="flex justify-between text-orange-600">
                                                        <span>Tax ({tax}%):</span>
                                                        <span>+Rs {taxAmount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                                    <span>Grand Total:</span>
                                                    <span className="text-blue-600">Rs {grandTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="p-6 pt-0 space-y-3">
                                <button
                                    onClick={generateInvoice}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <FiCheckCircle />
                                    Generate Invoice
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={printInvoice}
                                        disabled={items.length === 0}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FiPrinter />
                                        Print
                                    </button>
                                    <button
                                        onClick={downloadInvoice}
                                        disabled={items.length === 0}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FiDownload />
                                        Save
                                    </button>
                                </div>

                                <button
                                    onClick={resetForm}
                                    className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                                >
                                    Reset All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;