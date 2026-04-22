const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        default: 'Your Company Name'
    },
    companyEmail: {
        type: String,
        required: true,
        default: 'info@company.com'
    },
    companyPhone: {
        type: String,
        required: true,
        default: '+92 XXX XXXXXXX'
    },
    companyAddress: {
        type: String,
        required: true,
        default: '123 Business Street, City, Country'
    },
    companyLogo: {
        type: String,
        default: ''
    },
    taxRate: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'Rs'
    },
    invoiceFooter: {
        type: String,
        default: 'Thank you for your business!'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);