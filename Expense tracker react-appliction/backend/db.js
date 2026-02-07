const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

db.getConnection((err, conn) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to MySQL database');
        conn.release();
    }
});

module.exports = db;
