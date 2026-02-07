# Keep Up - Complete Integration Guide

## System Architecture

```
Frontend (React) ↔ Backend (Express) ↔ Database (MySQL)
Port 3002          Port 5000            expense_tracker
```

## Data Flow

### 1. User Registration Flow
```
User Input (Signup.js)
    ↓
registerUser() in api.js
    ↓
POST /api/auth/register
    ↓
Backend validates & hashes password with bcryptjs
    ↓
INSERT INTO users table
    ↓
Response with success message
    ↓
Redirect to login
```

### 2. User Login Flow
```
User Input (Login.js)
    ↓
loginUser() in api.js
    ↓
POST /api/auth/login
    ↓
Backend queries users table
    ↓
Compares password with bcryptjs
    ↓
Generates JWT token if valid
    ↓
Response with token + userName
    ↓
Frontend stores in localStorage
    ↓
Redirect to dashboard
```

### 3. Add Transaction Flow
```
User Input (Dashboard.js)
    ↓
addTransaction(token, data) in api.js
    ↓
POST /api/transactions with Bearer token
    ↓
Backend auth middleware validates token
    ↓
Extract user_id from decoded token
    ↓
INSERT INTO transactions with user_id
    ↓
Response with success message
    ↓
Frontend reloads transactions list
```

### 4. Get Transactions Flow
```
Dashboard component mounts
    ↓
loadTransactions(token) in api.js
    ↓
GET /api/transactions with Bearer token
    ↓
Backend auth middleware validates token
    ↓
SELECT * FROM transactions WHERE user_id
    ↓
Response with user's transactions
    ↓
Frontend displays in table with calculations
```

### 5. Delete Transaction Flow
```
User clicks delete button
    ↓
deleteTransaction(token, id) in api.js
    ↓
DELETE /api/transactions/:id with Bearer token
    ↓
Backend auth middleware validates token
    ↓
UPDATE transactions SET status='deleted'
    ↓
Response with success message
    ↓
Frontend reloads transactions list
```

## Database Integration Details

### Users Table
**Purpose:** Store user account information and authentication credentials

**Fields:**
- `id` - Primary Key, auto-increment
- `full_name` - User's full name (VARCHAR 255)
- `email` - Unique email for login (VARCHAR 255 UNIQUE)
- `password` - Bcrypt hashed password (VARCHAR 255)
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

**Security:**
- Passwords hashed with bcryptjs (10 salt rounds)
- Email unique constraint prevents duplicate accounts
- Timestamps track account activity

### Transactions Table
**Purpose:** Store all income/expense transactions for each user

**Fields:**
- `id` - Primary Key, auto-increment
- `user_id` - Foreign Key to users table
- `description` - Transaction description (VARCHAR 255)
- `amount` - Transaction amount (DECIMAL 10,2)
- `type` - Transaction type (ENUM: 'income', 'expense')
- `status` - Soft delete flag (VARCHAR 50, default 'active')
- `created_at` - Transaction creation date
- `updated_at` - Last modification date

**Relationships:**
- Foreign Key constraint on user_id
- Cascade delete when user is deleted
- Soft delete using status field
- Indexes on user_id and created_at for performance

## API Endpoints

### Authentication Routes

#### POST /api/auth/register
**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (Success):**
```json
{
  "message": "Registration successful"
}
```

**Response (Error):**
```json
{
  "error": "Duplicate entry for email",
  "message": "Email already exists"
}
```

**Database Operation:**
- Validates all fields present
- Hashes password with bcryptjs
- Inserts user into `users` table
- Returns success or error message

---

#### POST /api/auth/login
**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "full_name": "John Doe"
}
```

**Response (Error):**
```json
{
  "message": "Email not found"
}
```
or
```json
{
  "message": "Incorrect password"
}
```

**Database Operation:**
- Queries `users` table for email
- Compares password hash with bcryptjs
- Generates JWT token (24-hour expiration)
- Returns token for subsequent authenticated requests

---

### Transaction Routes (All Require Bearer Token)

#### GET /api/transactions
**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "description": "Grocery shopping",
    "amount": "50.00",
    "type": "expense",
    "status": "active",
    "created_at": "2026-01-17T10:30:00.000Z",
    "updated_at": "2026-01-17T10:30:00.000Z"
  },
  {
    "id": 2,
    "user_id": 1,
    "description": "Salary",
    "amount": "3000.00",
    "type": "income",
    "status": "active",
    "created_at": "2026-01-15T09:00:00.000Z",
    "updated_at": "2026-01-15T09:00:00.000Z"
  }
]
```

**Database Operation:**
- Validates JWT token
- Extracts user_id from token
- Selects transactions where user_id matches and status != 'deleted'
- Orders by created_at DESC
- Returns array of user's transactions

---

#### POST /api/transactions
**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "description": "Grocery shopping",
  "amount": 50.00,
  "type": "expense"
}
```

**Response:**
```json
{
  "message": "Transaction added"
}
```

**Database Operation:**
- Validates JWT token
- Extracts user_id from token
- Validates required fields (description, amount, type)
- Inserts into `transactions` table with user_id
- Auto-generates created_at timestamp
- Sets status to 'active'

---

#### DELETE /api/transactions/:id
**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Transaction deleted"
}
```

**Database Operation:**
- Validates JWT token
- Extracts user_id from token
- Updates transaction status to 'deleted' (soft delete)
- Ensures transaction belongs to authenticated user
- Does not permanently delete data (audit trail preserved)

---

## Token Storage & Management

### Frontend (localStorage)
```javascript
// After successful login
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
localStorage.setItem('userName', 'John Doe');

// On logout
localStorage.removeItem('token');
localStorage.removeItem('userName');
```

### Backend (JWT)
**Token Generation:**
```javascript
const token = jwt.sign(
    { id: user.id, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
);
```

**Token Validation:**
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// decoded = { id: 1, full_name: 'John Doe', iat: ..., exp: ... }
```

---

## Environment Configuration

**File:** `backend/.env`
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=expense_tracker
PORT=5000
JWT_SECRET=keepup_secret_key
```

**Frontend API Base:**
```javascript
const API_BASE_URL = "http://localhost:5000/api";
```

---

## Security Features

1. **Password Hashing**
   - bcryptjs with 10 salt rounds
   - One-way encryption
   - Different hash for same password

2. **JWT Authentication**
   - Stateless token-based auth
   - 24-hour expiration
   - Signature verification on backend

3. **Data Isolation**
   - Queries filtered by user_id
   - Users can only access their own data
   - Backend validates user ownership

4. **CORS Protection**
   - Backend configured to accept frontend requests
   - Prevents unauthorized cross-origin access

5. **Soft Deletes**
   - Transactions marked as deleted, not removed
   - Maintains audit trail
   - Enables data recovery if needed

---

## Testing Checklist

- [x] User can register with email and password
- [x] Password confirmation validated
- [x] Duplicate email prevention
- [x] User can login with correct credentials
- [x] Invalid credentials rejected
- [x] JWT token generated on login
- [x] Token stored in localStorage
- [x] Dashboard protected (requires login)
- [x] User can add income transactions
- [x] User can add expense transactions
- [x] Transactions saved to database
- [x] Transactions retrieved from database
- [x] Summary calculations accurate
- [x] User can delete transactions
- [x] Deleted transactions hidden from list
- [x] Logout clears token
- [x] Logout redirects to login

---

## Quick Start Commands

```bash
# Terminal 1 - Start Backend
cd backend
npm start

# Terminal 2 - Start Frontend (in project root)
npm start

# To initialize/reset database
cd backend
npm run init-db
```

**Access Application:** http://localhost:3002
