const mysql = require('mysql2');
require('dotenv').config();

// First connection to create database if not exists
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || ''
});

connection.connect((err) => {
    if (err) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }
    console.log('Connected to MySQL');

    // Create database if not exists
    const createDbQuery = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`;
    
    connection.query(createDbQuery, (err) => {
        if (err) {
            console.error('Error creating database:', err.message);
            connection.end();
            process.exit(1);
        }
        console.log(`Database '${process.env.DB_NAME}' is ready`);

        // Now connect to the specific database
        connection.changeUser({ database: process.env.DB_NAME }, (err) => {
            if (err) {
                console.error('Error selecting database:', err.message);
                connection.end();
                process.exit(1);
            }

            // Create users table
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    full_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `;

            connection.query(createUsersTable, (err) => {
                if (err) {
                    console.error('Error creating users table:', err.message);
                    connection.end();
                    process.exit(1);
                }
                console.log('✅ Users table created/verified');

                // Create transactions table
                const createTransactionsTable = `
                    CREATE TABLE IF NOT EXISTS transactions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        description VARCHAR(255) NOT NULL,
                        amount DECIMAL(10, 2) NOT NULL,
                        type ENUM('income', 'expense') NOT NULL,
                        status VARCHAR(50) DEFAULT 'active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        INDEX idx_user_id (user_id),
                        INDEX idx_created_at (created_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                `;

                connection.query(createTransactionsTable, (err) => {
                    if (err) {
                        console.error('Error creating transactions table:', err.message);
                        connection.end();
                        process.exit(1);
                    }
                    console.log('✅ Transactions table created/verified');

                    console.log('\n✅ Database initialization completed successfully!');
                    console.log('✅ Ready to run the server\n');
                    
                    connection.end();
                    process.exit(0);
                });
            });
        });
    });
});
