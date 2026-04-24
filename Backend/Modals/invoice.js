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

// Payment schema
const paymentSchema = new Schema(
    {
        paidAmount: {
            type: Number,
            default: 0
        },
        remainingAmount: {
            type: Number,
            default: 0
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "bank", "card"],
            default: "cash"
        },
        paymentStatus: {
            type: String,
            enum: ["paid", "partial", "pending"],
            default: "paid"
        },
        paymentDate: {
            type: Date,
            default: Date.now
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
        },

        payment: {
            type: paymentSchema,
            default: () => ({})
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Invoice", invoiceSchema);