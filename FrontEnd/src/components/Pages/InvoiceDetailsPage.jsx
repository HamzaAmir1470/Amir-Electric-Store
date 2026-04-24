// InvoiceDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiPrinter, FiPackage, FiUser, FiCalendar, FiPhone, FiMapPin, FiTag } from "react-icons/fi";
import { useSettings } from "../SettingContext";
import { handleError } from "../../utils";

const InvoiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings, loading: settingsLoading } = useSettings();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = "http://localhost:8080";

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        fetchInvoiceDetails();
    }, [id]);

    const fetchInvoiceDetails = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/invoices/${id}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error("Failed to fetch invoice details");
            }

            const result = await response.json();
            const invoiceData = result.data;

            // Format the invoice data to match the structure expected
            const formattedInvoice = {
                ...invoiceData,
                items: (invoiceData.items || []).map(item => ({
                    product: item.product || item.productName,
                    price: item.price,
                    qty: item.quantity || item.qty,
                    total: item.total || (item.price * (item.quantity || item.qty)),
                    pricingType: item.pricingType || invoiceData.pricingType
                })),
                date: invoiceData.date || invoiceData.createdAt,
                invoiceNumber: invoiceData.invoiceNumber
            };

            setInvoice(formattedInvoice);

        } catch (error) {
            console.error("Error fetching invoice:", error);
            handleError("Failed to load invoice details");
        } finally {
            setLoading(false);
        }
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
        return date.toLocaleDateString('en-PK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handlePrint = () => {
        if (!invoice) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice ${invoice.invoiceNumber}</title>
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
                            <div class="company-name">${settings?.companyName || 'Your Company Name'}</div>
                            <div class="company-details">
                                ${settings?.companyAddress || ''}<br/>
                                Phone: ${settings?.companyPhone || ''} | Email: ${settings?.companyEmail || ''}
                            </div>
                        </div>
                        <div class="invoice-title">
                            INVOICE
                            <span class="pricing-badge ${invoice.pricingType === 'retail' ? 'retail-badge' : 'wholesale-badge'}">
                                ${invoice.pricingType === 'retail' ? 'RETAIL PRICES' : 'WHOLESALE PRICES'}
                            </span>
                        </div>
                        <div class="invoice-meta">
                            <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
                            <div><strong>Date:</strong> ${formatDate(invoice.date)}</div>
                        </div>
                        <div class="customer-info">
                            <strong>Bill To:</strong><br/>
                            ${invoice.customer.name}<br/>
                            ${invoice.customer.phone || ''}<br/>
                            ${invoice.customer.email || ''}<br/>
                            ${invoice.customer.address || ''}
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
                                ${invoice.items.map(item => `
                                    <tr>
                                        <td>${item.product}${item.pricingType ? `<span style="font-size:10px; margin-left:8px;">(${item.pricingType})</span>` : ''}</td>
                                        <td class="text-right">${settings?.currency || 'Rs.'} ${item.price.toFixed(2)}</td>
                                        <td class="text-center">${item.qty}</td>
                                        <td class="text-right">${settings?.currency || 'Rs.'} ${item.total.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="totals">
                            <div>Subtotal: ${settings?.currency || 'Rs.'} ${invoice.subtotal?.toFixed(2) || invoice.grandTotal?.toFixed(2)}</div>
                            ${invoice.discount > 0 ? `<div>Discount (${invoice.discount}%): -${settings?.currency || 'Rs.'} ${invoice.discountAmount?.toFixed(2) || ((invoice.subtotal || invoice.grandTotal) * invoice.discount / 100).toFixed(2)}</div>` : ''}
                            ${invoice.tax > 0 ? `<div>Tax (${invoice.tax}%): +${settings?.currency || 'Rs.'} ${invoice.taxAmount?.toFixed(2) || ((invoice.subtotal || invoice.grandTotal) * invoice.tax / 100).toFixed(2)}</div>` : ''}
                            <div class="grand-total">Grand Total: ${settings?.currency || 'Rs.'} ${invoice.grandTotal.toFixed(2)}</div>
                        </div>
                        ${invoice.notes ? `
                            <div style="margin-top: 30px;">
                                <strong>Notes:</strong><br/>
                                <p style="margin-top: 5px;">${invoice.notes}</p>
                            </div>
                        ` : ''}
                        <div class="footer">
                            ${settings?.invoiceFooter || 'Thank you for your business!'}
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };

    if (settingsLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-3">{loading ? "Loading invoice..." : "Loading settings..."}</p>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FiPackage className="text-gray-300 text-5xl mx-auto mb-3" />
                    <p className="text-gray-500">Invoice not found</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow text-gray-600 transition"
                    >
                        <FiArrowLeft />
                        Back
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        <FiPrinter />
                        Print Invoice
                    </button>
                </div>

                {/* Invoice Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                    {/* Invoice Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">Invoice Details</h1>
                        <p className="text-blue-100">Invoice #{invoice.invoiceNumber}</p>
                    </div>

                    <div className="p-6">
                        {/* Pricing Type Badge */}
                        <div className="mb-4 pb-3 border-b">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${invoice.pricingType === "retail" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                                <FiTag className="text-xs" />
                                {invoice.pricingType === "retail" ? "RETAIL PRICES" : "WHOLESALE PRICES"}
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-6 border-b">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <FiUser className="text-blue-500" />
                                    Customer Information
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-gray-700">
                                        <span className="font-medium">Name:</span> {invoice.customer.name}
                                    </p>
                                    {invoice.customer.phone && (
                                        <p className="text-gray-700">
                                            <span className="font-medium flex items-center gap-1">
                                                <FiPhone size={14} /> Phone:
                                            </span> {invoice.customer.phone}
                                        </p>
                                    )}
                                    {invoice.customer.email && (
                                        <p className="text-gray-700">
                                            <span className="font-medium">Email:</span> {invoice.customer.email}
                                        </p>
                                    )}
                                    {invoice.customer.address && (
                                        <p className="text-gray-700">
                                            <span className="font-medium flex items-center gap-1">
                                                <FiMapPin size={14} /> Address:
                                            </span> {invoice.customer.address}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <FiCalendar className="text-blue-500" />
                                    Invoice Information
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-gray-700">
                                        <span className="font-medium">Date:</span> {formatDate(invoice.date)}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-medium">Status:</span>
                                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                            Paid
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FiPackage className="text-blue-500" />
                            Items Purchased
                        </h3>
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">#</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Quantity</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Unit Price</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoice.items.map((item, index) => (
                                        <motion.tr
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-800">{item.product}</div>
                                                {item.pricingType && (
                                                    <span className={`text-xs ${item.pricingType === "retail" ? "text-blue-600" : "text-orange-600"}`}>
                                                        ({item.pricingType})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center text-gray-700">
                                                {item.qty}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-700">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                                                {formatCurrency(item.total)}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="4" className="px-4 py-3 text-right font-bold text-base text-gray-800">
                                            Subtotal:
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                            {formatCurrency(invoice.subtotal || invoice.grandTotal)}
                                        </td>
                                    </tr>
                                    {invoice.discount > 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-2 text-right text-gray-600">
                                                Discount ({invoice.discount}%):
                                            </td>
                                            <td className="px-4 py-2 text-right text-red-600">
                                                -{formatCurrency(invoice.discountAmount || ((invoice.subtotal || invoice.grandTotal) * invoice.discount / 100))}
                                            </td>
                                        </tr>
                                    )}
                                    {invoice.tax > 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-2 text-right text-gray-600">
                                                Tax ({invoice.tax}%):
                                            </td>
                                            <td className="px-4 py-2 text-right text-orange-600">
                                                +{formatCurrency(invoice.taxAmount || ((invoice.subtotal || invoice.grandTotal) * invoice.tax / 100))}
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="border-t-2 border-gray-200">
                                        <td colSpan="4" className="px-4 py-3 text-right font-bold text-lg text-gray-800">
                                            Grand Total:
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-xl text-blue-600">
                                            {formatCurrency(invoice.grandTotal)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Notes:</span> {invoice.notes}
                                </p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-6 pt-4 border-t text-center text-gray-500 text-sm">
                            {settings?.invoiceFooter || 'Thank you for your business!'}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default InvoiceDetails;