const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

/* REGISTER */
router.post('/register', (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = `INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)`;

    db.query(sql, [full_name, email, hashedPassword], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Registration successful' });
    });
});

/* LOGIN */
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query(`SELECT * FROM users WHERE email = ?`, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(400).json({ message: 'Email not found' });
        }

        const user = results[0];
        const validPassword = bcrypt.compareSync(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign(
            { id: user.id, full_name: user.full_name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            full_name: user.full_name
        });
    });
});

module.exports = router;
