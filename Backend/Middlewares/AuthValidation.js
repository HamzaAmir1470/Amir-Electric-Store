const Joi = require('joi');

const signupValidation = (req, res, next) => {
    const schema = Joi.object({
        role: Joi.string().valid('user', 'admin').required(),
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
module.exports = {
    signupValidation,
    loginValidation,
    productValidation,
    updateProductValidation,
    bulkUpdateValidation

};