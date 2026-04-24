const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL is not configured");
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(process.env.MONGO_URL)
            .then((connection) => {
                console.log("Connected to MongoDB");
                return connection;
            })
            .catch((err) => {
                connectionPromise = null;
                console.error("Error connecting to MongoDB:", err);
                throw err;
            });
    }

    return connectionPromise;
};

module.exports = connectDB;
