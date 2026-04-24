const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const khataSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        customerName: {
            type: String,
            required: true,
            trim: true
        },

        phoneNumber: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: ""
        },

        address: {
            type: String,
            trim: true,
            default: ""
        },

        openingBalance: {
            type: Number,
            required: true,
            default: 0
        },

        remainingBalance: {
            type: Number,
            default: 0
        },

        transactions: [
            {
                type: Schema.Types.ObjectId,
                ref: "Transaction"
            }
        ]
    },
    {
        timestamps: true
    }
);

// Compound index for unique user + phone number
khataSchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });

// Index for searching by email
khataSchema.index({ userId: 1, email: 1 });

module.exports = mongoose.model("Khata", khataSchema);