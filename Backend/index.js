const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');
const KhataRouter = require('./Routes/khataRouter');

require('dotenv').config();
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});