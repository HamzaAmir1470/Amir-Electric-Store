const Invoice = require("../Modals/Invoice");

// ➤ Create Invoice
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

        const existingInvoice = await Invoice.findOne({ invoiceNumber });

        if (existingInvoice) {
            return res.status(409).json({
                message: "Invoice already exists"
            });
        }

        const invoice = await Invoice.create({
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
        });

        return res.status(201).json({
            message: "Invoice created successfully",
            data: invoice
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ➤ Get All Invoices
const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Invoices fetched successfully",
            data: invoices
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ➤ Get Single Invoice
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

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
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createInvoice,
    getAllInvoices,
    getInvoiceById
};