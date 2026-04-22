const Khata = require("../Modals/Khata");
const Transaction = require("../Modals/Transaction");

//  Create Khata
const createKhata = async (req, res) => {
    try {
        const { customerName, phoneNumber, openingBalance, remainingBalance, transactions } = req.body;

        if (!customerName || !openingBalance || !phoneNumber) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

        const existingKhata = await Khata.findOne({ phoneNumber });

        if (existingKhata) {
            return res.status(409).json({
                message: "Khata already exists for this phone number"
            });
        }

        const khata = await Khata.create({
            customerName,
            phoneNumber,
            openingBalance,
            remainingBalance,
            transactions
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


//  Get All Khatas
const getAllKhatas = async (req, res) => {
    try {
        const khatas = await Khata.find().sort({ createdAt: -1 });

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


//  Get Single Khata
const getKhataById = async (req, res) => {
    try {
        const khata = await Khata.findById(req.params.id);

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

// Update Khata
const updateKhata = async (req, res) => {
    try {
        const khataId = req.params.id;

        const khata = await Khata.findById(khataId);

        if (!khata) {
            return res.status(404).json({
                message: "Khata not found"
            });
        }

        // ✔ Only allow safe updates
        const allowedFields = ["customerName", "phoneNumber", "openingBalance", "remainingBalance"];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // ✔ Optional: auto-adjust logic (recommended)
        if (updates.openingBalance !== undefined && updates.remainingBalance === undefined) {
            const diff = updates.openingBalance - khata.openingBalance;
            updates.remainingBalance = khata.remainingBalance + diff;
        }

        const updatedKhata = await Khata.findByIdAndUpdate(
            khataId,
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

//  Delete Khata (Safe + Cascade Delete)
const deleteKhata = async (req, res) => {
    try {
        const khataId = req.params.id;

        // First check if khata exists
        const khata = await Khata.findById(khataId);

        if (!khata) {
            return res.status(404).json({
                message: "Khata not found"
            });
        }

        // Delete related transactions first
        await Transaction.deleteMany({ khata: khataId });

        // Then delete khata
        await Khata.findByIdAndDelete(khataId);

        return res.status(200).json({
            message: "Khata and related transactions deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const addTransaction = async (req, res) => {
    try {
        const khataId = req.params.id;

        const { amount, type, note, remainingBalance } = req.body;

        if (!amount || !type) {
            return res.status(400).json({
                message: "Amount and type are required"
            });
        }

        const khata = await Khata.findById(khataId);

        if (!khata) {
            return res.status(404).json({
                message: "Khata not found"
            });
        }

        // Create transaction
        const transaction = await Transaction.create({
            khata: khataId,
            amount,
            type,
            note
        });

        // Update balance
        khata.remainingBalance = remainingBalance;
        khata.transactions.push(transaction._id);

        await khata.save();

        return res.status(200).json({
            message: "Transaction added successfully",
            transaction
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get Transactions by Khata
const getTransactionsByKhata = async (req, res) => {
    try {
        const { id } = req.params;
        const transactions = await Transaction.find({ khata: id }) // ✅ fixed
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: transactions
        });

    } catch (error) {
        console.error("Get Transactions Error:", error);

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