# Store Rating System — Backend API

RESTful API built with **Node.js**, **Express.js**, and **MySQL**.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0+ (`mysql2` promise pool)
- **Auth**: JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing**: `bcryptjs`
- **Security**: `helmet`, `cors`, `express-rate-limit`
- **Validation**: `express-validator`

## Project Structure
```
backend/
├── src/
│   ├── config/          # MySQL connection pool & Auth constants
│   ├── controllers/     # HTTP request handlers
│   ├── middleware/      # JWT auth, role guard, validator, error handler
│   ├── routes/          # API route definitions
│   ├── services/        # Database & business logic
│   ├── utils/           # Response helpers & constants
│   └── app.js           # Express app setup
├── server.js            # Entry point
├── .env.example         # Environment template
├── package.json
└── README.md
```

## Setup Instructions

1. **Database Setup**:
   Import `database/schema.sql` into MySQL:
   ```bash
   mysql -u root -p < ../database/schema.sql
   ```

2. **Environment Configuration**:
   Copy `.env.example` to `.env` and fill in database credentials:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Server**:
   - Development mode (with auto-reload):
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

## API Endpoints Overview

| Method | Endpoint | Auth Required | Role Allowed | Description |
|--------|----------|---------------|--------------|-------------|
| POST | `/api/auth/register` | No | Anyone | Register a new user |
| POST | `/api/auth/register-owner` | No | Anyone (with invite code) | Register store owner + linked store |
| POST | `/api/auth/register-admin` | No | Anyone (with secret code) | Register administrator account |
| POST | `/api/auth/login` | No | Anyone | Login and receive JWT |
| POST | `/api/auth/logout` | Yes | Any Role | Log out session |
| POST | `/api/auth/change-password` | Yes | Any Role | Change account password |
| GET | `/api/users/profile` | Yes | Any Role | Get current user profile |
| PUT | `/api/users/profile` | Yes | Any Role | Update profile |
| GET | `/api/users/owner-dashboard` | Yes | Owner, Admin | Get stores owned by user + stats |
| GET | `/api/admin/dashboard` | Yes | Admin Only | Platform statistics overview |
| GET | `/api/admin/users` | Yes | Admin Only | List all users (search/filter/sort) |
| GET | `/api/admin/users/:id` | Yes | Admin Only | Get user details |
| POST | `/api/admin/users` | Yes | Admin Only | Create user account |
| GET | `/api/admin/stores` | Yes | Admin Only | List stores for admin |
| POST | `/api/admin/stores` | Yes | Admin Only | Create new store |
| GET | `/api/admin/audit-logs` | Yes | Admin Only | Paginated, filterable audit trail logs |
| GET | `/api/admin/audit-logs/stats` | Yes | Admin Only | Audit trail summary statistics |
| GET | `/api/stores` | Yes | Any Role | List stores (search, sort, rating) |
| GET | `/api/stores/:id` | Yes | Any Role | Store details |
| POST | `/api/stores` | Yes | Admin Only | Create store |
| PUT | `/api/stores/:id` | Yes | Admin Only | Update store |
| DELETE | `/api/stores/:id` | Yes | Admin Only | Delete store |
| POST | `/api/ratings` | Yes | Normal User | Submit or update store rating |
| GET | `/api/ratings/my` | Yes | Normal User | View own submitted ratings |
| GET | `/api/ratings/store/:storeId` | Yes | Owner, Admin | View ratings for specific store |
| GET | `/api/health` | No | Anyone | API health check |

## Database Migration for Existing Installations

If you have an existing database without the `audit_logs` table, execute:
```bash
mysql -u root -p store_rating_system < ../database/migrations/001_create_audit_logs.sql
```
No server reset is required; the table is created without modifying existing user, store, or rating records.

