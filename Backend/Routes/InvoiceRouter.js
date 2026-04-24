// routes/invoices.js
const express = require("express");
const router = express.Router();
const { invoiceValidation } = require("../Middlewares/AuthValidation");
const ensureAuthenticated = require("../Middlewares/Auth");
const {
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    getInvoicesByDate
} = require("../Controllers/InvoiceController");

// Create Invoice
router.post("/", ensureAuthenticated, invoiceValidation, createInvoice);

// Get All Invoices (no date filter)
router.get("/all", ensureAuthenticated, getAllInvoices);

// Get Invoices by Date (with query param)
router.get("/", ensureAuthenticated, getInvoicesByDate);

// Get Single Invoice
router.get("/:id", ensureAuthenticated, getInvoiceById);

module.exports = router;