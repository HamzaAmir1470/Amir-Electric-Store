const express = require("express");
const router = express.Router();
const { invoiceValidation } = require("../Middlewares/AuthValidation");

const {
    createInvoice,
    getAllInvoices,
    getInvoiceById
} = require("../Controllers/InvoiceController");



// Create Invoice
router.post("/", invoiceValidation, createInvoice);

//  Get All
router.get("/", getAllInvoices);

//  Get One
router.get("/:id", getInvoiceById);

module.exports = router;