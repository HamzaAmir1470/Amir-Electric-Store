const Joi = require('joi');

const signupValidation = (req, res, next) => {
    const schema = Joi.object({
        role: Joi.string().valid('user', 'admin').optional(),
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(100).required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    next();
};
const loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(100).required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    next();
};

const productValidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        purchasePrice: Joi.number().positive().required(),
        wholesalePrice: Joi.number().positive().optional(),
        retailPrice: Joi.number().positive().optional(),
        quantity: Joi.number().integer().positive().required(),
        category: Joi.string().max(50).optional(),
        imageUrl: Joi.string().uri().allow("").optional(),
        description: Joi.string().max(500).optional()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    next();
};

const updateProductValidation = (req, res, next) => {
    const schema = Joi.object({
        quantity: Joi.number().integer().positive(),
        purchasePrice: Joi.number().positive(),
        wholesalePrice: Joi.number().positive(),
        retailPrice: Joi.number().positive()
    }).min(1);

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    next();
};

const bulkUpdateValidation = (req, res, next) => {
    const schema = Joi.object({
        productIds: Joi.array().items(Joi.string()).min(1).required(),
        quantity: Joi.number().integer().positive().required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    next();
};


// Create Khata Validation
const createKhataValidation = (req, res, next) => {
    const schema = Joi.object({
        customerName: Joi.string().min(3).max(50).required(),
        phoneNumber: Joi.string()
            .pattern(/^[0-9]{10,15}$/)
            .allow("", null),
        openingBalance: Joi.number().required(),
        remainingBalance: Joi.number().allow(null).required(),
        transactions: Joi.array().items(
            Joi.object({
                type: Joi.string().valid("payment", "purchase").required(),
                amount: Joi.number().positive().required(),
                date: Joi.date().required(),
                note: Joi.string().max(200).allow(null)
            }).optional()
        )
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    next();
};


//  Update Khata Validation
const updateKhataValidation = (req, res, next) => {
    const schema = Joi.object({
        customerName: Joi.string().min(3).max(50),
        phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).allow("", null),
        openingBalance: Joi.number(),
        remainingBalance: Joi.number().allow(null)
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    next();
};


//  ID Validation (optional but professional)
const idValidation = (req, res, next) => {
    const schema = Joi.object({
        id: Joi.string().hex().length(24).required()
    });

    const { error } = schema.validate(req.params);

    if (error) {
        return res.status(400).json({
            message: "Invalid ID format"
        });
    }

    next();
};


//  Invoice Validation
const invoiceValidation = (req, res, next) => {
    const schema = Joi.object({
        invoiceNumber: Joi.string().required(),
        date: Joi.date().optional(),
        userId: Joi.string().hex().length(24).required(), 
        customer: Joi.object({
            name: Joi.string().required(),
            phone: Joi.string().allow(""),
            email: Joi.string().email().allow(""),
            address: Joi.string().allow("")
        }).required(),

        items: Joi.array()
            .items(
                Joi.object({
                    product: Joi.string().required(),
                    price: Joi.number().required(),
                    qty: Joi.number().required(),
                    total: Joi.number().required(),
                    pricingType: Joi.string().valid("retail", "wholesale")
                })
            )
            .min(1)
            .required(),

        pricingType: Joi.string().valid("retail", "wholesale"),

        subtotal: Joi.number().required(),
        discount: Joi.number().min(0).max(100),
        discountAmount: Joi.number(),
        tax: Joi.number().min(0).max(100),
        taxAmount: Joi.number(),
        grandTotal: Joi.number().required(),
        notes: Joi.string().allow("")
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    next();
};

const logoutValidation = (req, res, next) => {
    const schema = Joi.object({
        token: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    next();
};


module.exports = {
    signupValidation,
    loginValidation,
    productValidation,
    updateProductValidation,
    bulkUpdateValidation,
    createKhataValidation,
    updateKhataValidation,
    idValidation,
    invoiceValidation,
    logoutValidation
};