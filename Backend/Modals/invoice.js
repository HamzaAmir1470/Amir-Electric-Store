const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceItemSchema = new Schema(
    {
        product: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        qty: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        },
        pricingType: {
            type: String,
            enum: ["retail", "wholesale"],
            default: "retail"
        }
    },
    { _id: false }
);

const invoiceSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        invoiceNumber: {
            type: String,
            required: true,
            unique: true
        },

        date: {
            type: Date,
            default: Date.now
        },

        customer: {
            name: String,
            phone: String,
            email: String,
            address: String
        },

        items: [invoiceItemSchema],

        pricingType: {
            type: String,
            enum: ["retail", "wholesale"],
            default: "retail"
        },

        subtotal: {
            type: Number,
            required: true
        },

        discount: {
            type: Number,
            default: 0
        },

        discountAmount: {
            type: Number,
            default: 0
        },

        tax: {
            type: Number,
            default: 0
        },

        taxAmount: {
            type: Number,
            default: 0
        },

        grandTotal: {
            type: Number,
            required: true
        },

        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Invoice", invoiceSchema);