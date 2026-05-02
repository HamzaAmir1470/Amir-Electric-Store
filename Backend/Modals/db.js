const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_URL;

if (!mongo_url) {
    console.warn('MONGO_URL is not set');
} else {
    const cached = global.__mongooseConnection;

    if (cached?.readyState === 1) {
        module.exports = mongoose;
    } else {
        global.__mongooseConnection = mongoose.connect(mongo_url)
            .then((connection) => {
                console.log('Connected to MongoDB');
                return connection;
            })
            .catch((err) => {
                console.error('Error connecting to MongoDB:', err);
                throw err;
            });
    }
}

module.exports = mongoose;