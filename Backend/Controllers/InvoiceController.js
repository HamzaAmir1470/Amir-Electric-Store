// Controllers/InvoiceController.js
const Invoice = require("../Modals/invoice");
const Khata = require("../Modals/Khata");
const Transaction = require("../Modals/Transaction");

// ➤ Create Invoice (USER ISOLATED) with Payment and Khata support
const createInvoice = async (req, res) => {
    try {
        const {
            invoiceNumber,
            date,
            customer,
            items,
            pricingType,
            subtotal,
            discount,
            discountAmount,
            tax,
            taxAmount,
            grandTotal,
            notes,
            payment
        } = req.body;

        if (!customer?.name || !items || items.length === 0) {
            return res.status(400).json({
                message: "Customer name and items are required"
            });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const existingInvoice = await Invoice.findOne({ invoiceNumber });

        if (existingInvoice) {
            return res.status(409).json({
                message: "Invoice already exists"
            });
        }

        // Prepare payment data
        const paymentData = payment || {
            paidAmount: grandTotal,
            remainingAmount: 0,
            paymentMethod: "cash",
            paymentStatus: "paid",
            paymentDate: new Date()
        };

        // Create invoice
        const invoice = await Invoice.create({
            userId: req.user._id,
            invoiceNumber,
            date: date || new Date(),
            customer,
            items,
            pricingType,
            subtotal,
            discount,
            discountAmount,
            tax,
            taxAmount,
            grandTotal,
            notes,
            payment: paymentData
        });

        // Handle khata for partial payments
        if (paymentData.paymentStatus === "partial" && paymentData.remainingAmount > 0) {
            // Check if customer already exists in khata
            let khataEntry = await Khata.findOne({
                userId: req.user._id,
                phoneNumber: customer.phone
            });

            if (khataEntry) {
                // Update existing khata - Add transaction
                const transaction = await Transaction.create({
                    khata: khataEntry._id,
                    amount: paymentData.remainingAmount,
                    type: "credit", // Credit means customer owes money
                    note: `Invoice ${invoiceNumber} - Partial payment. Remaining balance ${paymentData.remainingAmount} added.`,
                    date: new Date()
                });

                // Add transaction to khata
                khataEntry.transactions.push(transaction._id);
                
                // Update remaining balance
                khataEntry.remainingBalance = (khataEntry.remainingBalance || 0) + paymentData.remainingAmount;
                
                await khataEntry.save();
            } else {
                // Create new khata entry
                khataEntry = await Khata.create({
                    userId: req.user._id,
                    customerName: customer.name,
                    phoneNumber: customer.phone,
                    email: customer.email,
                    address: customer.address,
                    openingBalance: paymentData.remainingAmount,
                    remainingBalance: paymentData.remainingAmount,
                    transactions: []
                });

                // Create transaction
                const transaction = await Transaction.create({
                    khata: khataEntry._id,
                    amount: paymentData.remainingAmount,
                    type: "credit",
                    note: `Invoice ${invoiceNumber} - Partial payment. Remaining balance ${paymentData.remainingAmount} added.`,
                    date: new Date()
                });

                // Add transaction to khata
                khataEntry.transactions.push(transaction._id);
                await khataEntry.save();
            }
        }

        return res.status(201).json({
            message: "Invoice created successfully",
            data: invoice,
            khata: paymentData.paymentStatus === "partial" ? "Khata updated" : null
        });

    } catch (error) {
        console.error("Create invoice error:", error);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// GET /invoices?date=2024-01-15 (Get invoices by date)
const getInvoicesByDate = async (req, res) => {
    try {
        const { date } = req.query;

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        let query = { userId: req.user._id };

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        const invoices = await Invoice.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: invoices,
            count: invoices.length
        });

    } catch (error) {
        console.error("Error fetching invoices by date:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// ➤ Get All Invoices (USER ISOLATED) - No date filter
const getAllInvoices = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const invoices = await Invoice.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Invoices fetched successfully",
            data: invoices,
            count: invoices.length
        });

    } catch (error) {
        console.error("Get all invoices error:", error);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// ➤ Get Single Invoice (SECURE)
const getInvoiceById = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const invoice = await Invoice.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        return res.status(200).json({
            message: "Invoice fetched successfully",
            data: invoice
        });

    } catch (error) {
        console.error("Get invoice by id error:", error);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    getInvoicesByDate
};
