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

khataSchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });

module.exports = mongoose.model("Khata", khataSchema);