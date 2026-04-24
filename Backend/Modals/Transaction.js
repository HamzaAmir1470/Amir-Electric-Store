const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
    {
        khata: {
            type: Schema.Types.ObjectId,
            ref: "Khata",
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        type: {
            type: String,
            enum: ["payment", "credit"],
            required: true
        },

        note: {
            type: String,
            default: ""
        },

        invoiceNumber: {
            type: String,
            default: ""
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "bank", "card"],
            default: "cash"
        },

        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Index for faster queries
transactionSchema.index({ khata: 1, createdAt: -1 });
transactionSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);