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


//  Create
router.post(
    "/",
    createKhataValidation,
    createKhata
);

//  Get All
router.get("/", getAllKhatas);

//  Get Single
router.get("/:id", idValidation, getKhataById);

//  Update
router.put(
    "/:id",
    idValidation,
    updateKhataValidation,
    updateKhata
);

//  Delete
router.delete(
    "/:id",
    idValidation,
    deleteKhata
);

router.get("/:id/transactions", idValidation, getTransactionsByKhata);

router.put("/:id/transaction", addTransaction);

module.exports = router;