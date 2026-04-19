const router = require("express").Router();
const {
    createProduct,
    getProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateProducts
} = require("../Controllers/ProductController");

const { productValidation, updateProductValidation, bulkUpdateValidation } = require("../Middlewares/AuthValidation");

// Create
router.post("/", productValidation, createProduct);

// Read
router.get("/", getProducts);
router.get("/:id", getSingleProduct);

// Update
router.put("/:id", updateProductValidation, updateProduct);
router.put("/bulk-update", bulkUpdateValidation, bulkUpdateProducts);
// Delete
router.delete("/:id", deleteProduct);

module.exports = router;