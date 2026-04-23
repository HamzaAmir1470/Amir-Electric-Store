const Product = require('../Modals/Product');

exports.createProduct = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            name,
            purchasePrice,
            wholesalePrice,
            retailPrice,
            quantity,
            category,
            description,
            imageUrl
        } = req.body;

        const product = new Product({
            userId,
            name,
            purchasePrice,
            wholesalePrice,
            retailPrice,
            quantity,
            category,
            description,
            imageUrl
        });

        const savedProduct = await product.save();

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: savedProduct
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating product",
            error: error.message
        });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const userId = req.user.id;

        const products = await Product.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message
        });
    }
};


exports.getSingleProduct = async (req, res) => {
    try {
        const userId = req.user.id;

        const product = await Product.findOne({
            _id: req.params.id,
            userId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching product",
            error: error.message
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const product = await Product.findOne({ _id: id, userId });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const allowedFields = [
            "quantity",
            "purchasePrice",
            "wholesalePrice",
            "retailPrice",
            "name",
            "category",
            "description",
            "imageUrl"
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        const updatedProduct = await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: error.message
        });
    }
};

exports.bulkUpdateProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productIds, quantity } = req.body;

        if (!productIds || !productIds.length) {
            return res.status(400).json({ message: "No product IDs provided" });
        }

        await Product.updateMany(
            {
                _id: { $in: productIds },
                userId // 🔥 SECURITY FIX
            },
            { $set: { quantity } }
        );

        res.status(200).json({
            success: true,
            message: "Bulk update successful",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Bulk update failed",
            error: error.message
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const userId = req.user.id;

        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            userId
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: error.message
        });
    }
};