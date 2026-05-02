require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');
const KhataRouter = require('./Routes/khataRouter');
const InvoiceRouter = require('./Routes/InvoiceRouter');
const SettingRouter = require('./Routes/SettingRouter');
const contactRoutes = require('./Routes/contactRoutes');

require('./Modals/db');

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Amir Electric Store API is running'
  });
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
    'http://localhost:5173',
    'http://localhost:3000'
  ];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);
app.use('/khata', KhataRouter);
app.use('/invoices', InvoiceRouter);
app.use('/settings', SettingRouter);
app.use('/contact', contactRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;