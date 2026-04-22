const express = require("express");
const router = express.Router();
const { invoiceValidation } = require("../Middlewares/AuthValidation");
const ensureAuthenticated = require("../Middlewares/Auth");
const {
    createInvoice,
    getAllInvoices,
    getInvoiceById
} = require("../Controllers/InvoiceController");



// Create Invoice
router.post("/",ensureAuthenticated, invoiceValidation, createInvoice);

//  Get All
router.get("/", ensureAuthenticated, getAllInvoices);

//  Get One
router.get("/:id", ensureAuthenticated, getInvoiceById);

module.exports = router;