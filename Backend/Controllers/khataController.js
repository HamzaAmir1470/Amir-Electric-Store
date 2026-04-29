const Khata = require("../Modals/Khata");
const Transaction = require("../Modals/Transaction");

const createKhata = async (req, res) => {
    try {
        const {
            customerName,
            phoneNumber,
            email,
            address,
            openingBalance,
            transactions = []
        } = req.body;

        if (!customerName || !phoneNumber) {
            return res.status(400).json({
                message: "Customer name and phone number are required"
            });
        }

        // Calculate transaction impact
        const transactionTotal = transactions.reduce((sum, tx) => {
            if (tx.type === "debit") return sum + tx.amount;
            if (tx.type === "credit") return sum - tx.amount;
            return sum;
        }, 0);

        const khata = await Khata.findOneAndUpdate(
            {
                userId: req.user._id,
                phoneNumber: phoneNumber
            },
            {
                $set: {
                    customerName,
                    email: email || "",
                    address: address || ""
                },
                $setOnInsert: {
                    openingBalance: openingBalance || 0
                },
                $push: {
                    transactions: { $each: transactions }
                },
                $inc: {
                    remainingBalance: transactionTotal + (openingBalance || 0)
                }
            },
            {
                returnDocument: "after",
                upsert: true
            }
        );

        return res.status(200).json({
            message: "Khata created or updated with ledger entry",
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
            userId: req.user._id
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

// ➤ GET KHATA BY PHONE NUMBER
const getKhataByPhone = async (req, res) => {
    try {
        const { phone } = req.params;

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const khata = await Khata.findOne({
            userId: req.user._id,
            phoneNumber: phone
        }).populate('transactions');

        return res.status(200).json({
            success: true,
            data: khata
        });

    } catch (error) {
        console.error("Get khata by phone error:", error);
        return res.status(500).json({
            success: false,
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
            userId: req.user._id
        }).populate('transactions');

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

        const allowedFields = ["customerName", "phoneNumber", "email", "address", "openingBalance", "remainingBalance"];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedKhata = await Khata.findByIdAndUpdate(
            khata._id,
            { $set: updates },
            { returnDocument: "after" }
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
        const { amount, type, note, invoiceNumber, paymentMethod } = req.body;

        const khata = await Khata.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!khata) {
            return res.status(404).json({
                message: "Khata not found"
            });
        }

        // Create enhanced note with invoice info if provided
        let transactionNote = note || "";
        if (invoiceNumber) {
            transactionNote = `Invoice ${invoiceNumber} - ${transactionNote}`;
        }

        const transaction = await Transaction.create({
            khata: khata._id,
            amount,
            type,
            note: transactionNote,
            date: new Date()
        });

        khata.transactions.push(transaction._id);

        // Update balance based on transaction type
        if (type === "payment") {
            // Payment reduces the balance (customer paid)
            khata.remainingBalance -= amount;
        } else if (type === "credit") {
            // Credit increases the balance (customer owes more)
            khata.remainingBalance += amount;
        }

        await khata.save();

        // Populate the transaction before sending response
        const populatedTransaction = await Transaction.findById(transaction._id);

        return res.status(200).json({
            message: "Transaction added successfully",
            transaction: populatedTransaction,
            remainingBalance: khata.remainingBalance
        });

    } catch (error) {
        console.error("Add transaction error:", error);
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
            data: transactions,
            balance: khata.remainingBalance
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
    getKhataByPhone,
    deleteKhata,
    addTransaction,
    getTransactionsByKhata
};