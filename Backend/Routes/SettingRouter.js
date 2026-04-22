const express = require('express');
const router = express.Router();
const Settings = require('../Modals/Setting');

// Get settings (public)
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        if (!settings) {
            // Create default settings if none exist
            settings = await Settings.create({
                companyName: 'Your Company Name',
                companyEmail: 'info@company.com',
                companyPhone: '+92 XXX XXXXXXX',
                companyAddress: '123 Business Street, City, Country',
                taxRate: 0,
                currency: 'Rs',
                invoiceFooter: 'Thank you for your business!'
            });
        }
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update settings (admin only)
router.put('/', async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            {},
            req.body,
            { new: true, upsert: true }
        );
        
        res.json({
            success: true,
            data: settings,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;