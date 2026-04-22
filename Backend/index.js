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

require('./Modals/db');

const PORT = process.env.PORT || 8080;

app.get('/ping', (req, res) => {
    res.send('pong');
});


app.use(bodyParser.json());
app.use(cors());
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);
app.use('/khata', KhataRouter);
app.use('/invoices', InvoiceRouter);
app.use('/settings', SettingRouter);
app.use('/contact', contactRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});