const db = require('./db');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express('');

app.use(cors());
app.use(bodyParser.json());

app.get('/', (reg, res) => {
    res.send('Backend is running');
});
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
//users(signup) API
app.post('/register', (req, res) => {
    const { full_name, email, password } = req.body;

    const sql = 'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [full_name, email, password], (err) => {
        if (err) {
            res.json({ message: 'Registration failed' });
        } else {
            res.json({ message: 'User registered successfully' });
        }
    });
});