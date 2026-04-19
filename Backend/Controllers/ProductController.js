const Product = require('../Modals/Product');

exports.createProduct = async (req, res) => {
    try {
        const { name, purchasePrice, wholesalePrice, retailPrice, quantity, category, description, imageUrl } = req.body;

        const product = new Product({
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
        const products = await Product.find().sort({ createdAt: -1 });

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
        const product = await Product.findById(req.params.id);

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
        const { id } = req.params;

        const {
            quantity,
            purchasePrice,
            wholesalePrice,
            retailPrice
        } = req.body;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (quantity !== undefined) product.quantity = quantity;
        if (purchasePrice !== undefined) product.purchasePrice = purchasePrice;
        if (wholesalePrice !== undefined) product.wholesalePrice = wholesalePrice;
        if (retailPrice !== undefined) product.retailPrice = retailPrice;

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
        const { productIds, quantity } = req.body;

        if (!productIds || !productIds.length) {
            return res.status(400).json({ message: "No product IDs provided" });
        }

        await Product.updateMany(
            { _id: { $in: productIds } },
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
        const product = await Product.findByIdAndDelete(req.params.id);

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