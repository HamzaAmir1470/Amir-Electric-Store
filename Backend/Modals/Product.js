const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    wholesalePrice: Number,
    retailPrice: Number,
    quantity: {
        type: Number,
        required: true
    },
    category: String,
    description: String,
    imageUrl: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);