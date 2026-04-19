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

        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Transaction", transactionSchema);