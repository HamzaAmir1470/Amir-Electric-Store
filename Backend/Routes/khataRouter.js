const express = require("express");
const router = express.Router();

const {
    createKhata,
    getAllKhatas,
    getKhataById,
    updateKhata,
    deleteKhata,
    addTransaction,
    getTransactionsByKhata
} = require("../controllers/khataController");


const {
    createKhataValidation,
    updateKhataValidation,
    idValidation
} = require("../Middlewares/AuthValidation");
const ensureAuthenticated = require("../Middlewares/Auth");

//  Create
router.post(
    "/",
    ensureAuthenticated,
    createKhataValidation,
    createKhata
);

//  Get All
router.get("/", ensureAuthenticated, getAllKhatas);

//  Get Single
router.get("/:id", ensureAuthenticated, idValidation, getKhataById);

//  Update
router.put(
    "/:id",
    ensureAuthenticated,
    idValidation,
    updateKhataValidation,
    updateKhata
);

//  Delete
router.delete(
    "/:id",
    ensureAuthenticated,
    idValidation,
    deleteKhata
);

router.get("/:id/transactions", ensureAuthenticated, idValidation, getTransactionsByKhata);

router.put("/:id/transaction", ensureAuthenticated, idValidation, addTransaction);

module.exports = router;