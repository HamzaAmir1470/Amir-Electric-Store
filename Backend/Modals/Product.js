const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    wholesalePrice: {
        type: Number,
    },
    retailPrice: {
        type: Number,
    },
    quantity: {
        type: Number,
        required: true
    },
    category: {
        type: String,
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);