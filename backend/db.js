const mysql = require('mysql2');

const db = mysql.createConnection( {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'expense_tracker'
});

db.connect((err) => {
    if (err) {
        console.log('Database connection failed');
        console.error(err);
    } else {
        console.log('Connected to MYSQL database');
    }
});

module.exports = db;