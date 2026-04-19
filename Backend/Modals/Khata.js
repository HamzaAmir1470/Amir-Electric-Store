const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const khataSchema = new Schema(
    {
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