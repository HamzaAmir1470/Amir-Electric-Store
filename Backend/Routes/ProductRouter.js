const router = require("express").Router();

const {
    createProduct,
    getProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateProducts,
    getAllproducts
} = require("../Controllers/ProductController");

const {
    productValidation,
    updateProductValidation,
    bulkUpdateValidation,
    idValidation
} = require("../Middlewares/AuthValidation");

const auth = require("../Middlewares/auth");

router.post(
    "/",
    auth,
    productValidation,
    createProduct
);


router.get(
    "/",
    auth,
    getProducts
);
router.get(
    "/all",
    // auth,
    getAllproducts
);

router.put(
    "/bulk-update",
    auth,
    bulkUpdateValidation,
    bulkUpdateProducts
);


router.get(
    "/:id",
    auth,
    idValidation,
    getSingleProduct
);

router.put(
    "/:id",
    auth,
    idValidation,
    updateProductValidation,
    updateProduct
);

router.delete(
    "/:id",
    auth,
    idValidation,
    deleteProduct
);

module.exports = router;