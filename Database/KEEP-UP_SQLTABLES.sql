CREATE TABLE users (
id int AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
enail VARCHAR(255) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 
 CREATE TABLE categories(
id int AUTO_INCREMENT PRIMARY KEY,
user_id INT NULL,
name VARCHAR(100) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE (user_id, name),
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
); 
CREATE TABLE Expenses(
expense_id int AUTO_INCREMENT PRIMARY KEY,
user_id int NOT NULL,
category_id INT ,
amount DECIMAL (10,2) NOT NULL CHECK(amount>=0),
currency CHAR(4) DEFAULT 'FCFA',
note VARCHAR (500),
incurred_at DATETIME NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
INDEX idx_user_incurred (user_id, incurred_at) , 
INDEX idx_category (category_id)
);
CREATE TABLE budgets (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
category_id INT NULL,
amount DECIMAL(10, 2) NOT NULL,
month YEAR (4) NOT NULL,
month_num TINYINT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
UNIQUE (user_id, category_id, month, month_num)
); 