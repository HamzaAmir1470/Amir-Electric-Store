const Khata = require("../Modals/Khata");
const Transaction = require("../Modals/Transaction");


// ➤ CREATE KHATA (ISOLATED)
const createKhata = async (req, res) => {
    try {
        const { customerName, phoneNumber, openingBalance, remainingBalance, transactions } = req.body;

        if (!customerName || !openingBalance || !phoneNumber) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

        const existingKhata = await Khata.findOne({
            phoneNumber,
            userId: req.user._id   // 🔥 isolation check
        });

        if (existingKhata) {
            return res.status(409).json({
                message: "Khata already exists for this phone number"
            });
        }

        const khata = await Khata.create({
            userId: req.user._id,   // 🔥 IMPORTANT FIX
            customerName,
            phoneNumber,
            openingBalance,
            remainingBalance,
            transactions: transactions || []
        });

        return res.status(201).json({
            message: "Khata created successfully",
            data: khata
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ➤ GET ALL KHATAS (ISOLATED)
const getAllKhatas = async (req, res) => {
    try {
        const khatas = await Khata.find({
            userId: req.user._id   // 🔥 IMPORTANT FIX
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Khatas fetched successfully",
            data: khatas
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ➤ GET SINGLE KHATA (SECURE)
const getKhataById = async (req, res) => {
    try {
        const khata = await Khata.findOne({
            _id: req.params.id,
            userId: req.user._id   // 🔥 SECURITY FIX
        });

        if (!khata) {
            return res.status(404).json({
                message: "Khata not found"
            });
        }

        return res.status(200).json({
            message: "Khata fetched successfully",
            data: khata
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ➤ UPDATE KHATA (SECURE)
const updateKhata = async (req, res) => {
    try {
        const khata = await Khata.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!khata) {
            return res.status(404).json({
                message: "Khata not found"
            });
        }

        const allowedFields = ["customerName", "phoneNumber", "openingBalance", "remainingBalance"];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedKhata = await Khata.findByIdAndUpdate(
            khata._id,
            { $set: updates },
            { new: true }
        );

        return res.status(200).json({
            message: "Khata updated successfully",
            data: updatedKhata
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ➤ DELETE KHATA (SECURE + CASCADE)
const deleteKhata = async (req, res) => {
    try {
        const khata = await Khata.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!khata) {
            return res.status(404).json({
                message: "Khata not found"
            });
        }

        await Transaction.deleteMany({ khata: khata._id });
        await Khata.findByIdAndDelete(khata._id);

        return res.status(200).json({
            message: "Khata and transactions deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ➤ ADD TRANSACTION (FIXED)
const addTransaction = async (req, res) => {
    try {
        const { amount, type, note } = req.body;

        const khata = await Khata.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!khata) {
            return res.status(404).json({
                message: "Khata not found"
            });
        }

        const transaction = await Transaction.create({
            khata: khata._id,
            amount,
            type,
            note
        });

        khata.transactions.push(transaction._id);

        // optional: auto balance logic (safer)
        if (type === "payment") {
            khata.remainingBalance -= amount;
        } else {
            khata.remainingBalance += amount;
        }

        await khata.save();

        return res.status(200).json({
            message: "Transaction added successfully",
            transaction
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ➤ GET TRANSACTIONS (SECURE)
const getTransactionsByKhata = async (req, res) => {
    try {
        const khata = await Khata.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!khata) {
            return res.status(404).json({
                message: "Khata not found"
            });
        }

        const transactions = await Transaction.find({
            khata: khata._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: transactions
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching transactions",
            error: error.message
        });
    }
};


module.exports = {
    createKhata,
    getAllKhatas,
    getKhataById,
    updateKhata,
    deleteKhata,
    addTransaction,
    getTransactionsByKhata
};