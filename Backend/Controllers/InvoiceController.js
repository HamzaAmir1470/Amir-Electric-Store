// Controllers/InvoiceController.js
const Invoice = require("../Modals/Invoice");

// ➤ Create Invoice (USER ISOLATED)
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
            notes
        } = req.body;

        if (!customer?.name || !items || items.length === 0) {
            return res.status(400).json({
                message: "Customer name and items are required"
            });
        }

        // Check if user exists in request
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

        const invoice = await Invoice.create({
            userId: req.user._id,   // ✅ Use req.user._id consistently
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
            notes
        });

        return res.status(201).json({
            message: "Invoice created successfully",
            data: invoice
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

        // ✅ Fix: Use req.user._id consistently
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

            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };

            console.log(`Fetching invoices for date range: ${startDate} to ${endDate}`);
        }

        const invoices = await Invoice.find(query).sort({ createdAt: -1 });

        console.log(`Found ${invoices.length} invoices for user ${req.user._id}`);

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