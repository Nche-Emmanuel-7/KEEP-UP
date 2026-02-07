# Keep Up - Expense Tracker

A full-stack expense tracking application with authentication and real-time transaction management.

## Tech Stack

**Frontend:**
- React 19
- React Router DOM
- CSS3

**Backend:**
- Node.js + Express
- MySQL 2
- JWT Authentication
- Bcrypt Password Hashing

## Prerequisites

- Node.js (v14 or higher)
- XAMPP (MySQL running on localhost:3306)
- npm

## Setup Instructions

### 1. Database Setup

Make sure XAMPP MySQL is running. Then initialize the database:

```bash
cd backend
npm run init-db
```

This will:
- Create the `expense_tracker` database
- Create `users` table
- Create `transactions` table

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

The server will run on `http://localhost:5000`

### 3. Frontend Setup

In a new terminal window:

```bash
npm install
npm start
```

The frontend will run on `http://localhost:3000` (or another available port)

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
  Returns: `{ message, token, full_name }`

### Transaction Routes (`/api/transactions`)

All routes require `Authorization: Bearer <token>` header

- `GET /api/transactions` - Get all transactions for logged-in user
- `POST /api/transactions` - Add new transaction
  ```json
  {
    "description": "Grocery shopping",
    "amount": 50.00,
    "type": "expense"
  }
  ```
- `DELETE /api/transactions/:id` - Delete transaction

## Environment Variables

The `.env` file in the backend folder contains:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=expense_tracker
PORT=5000
JWT_SECRET=keepup_secret_key
```

## Database Schema

### Users Table
- `id` - Primary Key
- `full_name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Transactions Table
- `id` - Primary Key
- `user_id` - Foreign Key (users.id)
- `description` - Transaction description
- `amount` - Transaction amount
- `type` - 'income' or 'expense'
- `status` - 'active' or 'deleted'
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Features

✅ User Registration & Login
✅ JWT Token Authentication
✅ Add Transactions (Income/Expense)
✅ View Transaction History
✅ Delete Transactions
✅ Dashboard with Summary Stats
✅ Responsive Design

## Troubleshooting

### Database Connection Failed
1. Verify XAMPP MySQL is running
2. Check that credentials in `.env` are correct
3. Ensure `expense_tracker` database exists (run `npm run init-db`)

### CORS Errors
The backend is configured with CORS enabled. Make sure frontend and backend URLs match in requests.

### Port Already in Use
- Frontend will automatically try the next available port if 3000 is taken
- To change backend port, modify `PORT` in `.env`

## Development Notes

- Passwords are hashed using bcryptjs with salt rounds of 10
- JWT tokens expire in 24 hours
- Frontend stores token and user name in localStorage
- All transaction queries are filtered by user_id for security
