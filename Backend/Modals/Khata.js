const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const khataSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true   // 🔥 important for performance
        },

        customerName: {
            type: String,
            required: true,
            trim: true
        },

        phoneNumber: {
            type: String,
            unique: true,
            trim: true
        },

        openingBalance: {
            type: Number,
            required: true
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

module.exports = mongoose.model("Khata", khataSchema);