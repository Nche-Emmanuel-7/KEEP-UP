const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const transactionRoutes = require('./routes/transaction.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
    res.send('Keep Up backend running');
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
});

module.exports = app;
