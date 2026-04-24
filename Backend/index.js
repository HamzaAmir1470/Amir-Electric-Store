require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');
const KhataRouter = require('./Routes/khataRouter');
const InvoiceRouter = require('./Routes/InvoiceRouter');
const SettingRouter = require('./Routes/SettingRouter');
const contactRoutes = require('./Routes/contactRoutes');
const connectDB = require('./Modals/db');

const PORT = process.env.PORT || 8080;
const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.set("trust proxy", 1);

app.get('/ping', (req, res) => {
    res.send('pong');
});


app.use(bodyParser.json());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
}));
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);
app.use('/khata', KhataRouter);
app.use('/invoices', InvoiceRouter);
app.use('/settings', SettingRouter);
app.use('/contact', contactRoutes);

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    });
