# Store Rating Management System

A production-quality web application designed for browsing stores, submitting verified customer ratings, managing user roles, and monitoring platform governance through a secure **Admin Audit Trail**.

## Tech Stack
- **Frontend**: React.js, Vite, Framer Motion, ApexCharts, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0+ (`mysql2` promise pool)
- **Authentication**: JWT (JSON Web Tokens) with role-based access control (Admin, Store Owner, Normal User)
- **Password Hashing**: bcryptjs
- **Security & Governance**: Append-only Admin Audit Trail, Helmet, CORS, Rate Limiting, Input Sanitization

## Directory Structure
```text
store-rating-system/
├── backend/            # Express.js REST API, controllers, services, routes, middleware
├── database/           # MySQL Schema, migrations (001_create_audit_logs.sql), and views
├── frontend/           # React + Vite application (Admin, Owner, User portals)
└── README.md
```

## Quick Start

### 1. Database Setup
For fresh installation:
```bash
mysql -u root -p < database/schema.sql
```
For existing installation (to add the audit logs table without touching other data):
```bash
mysql -u root -p store_rating_system < database/migrations/001_create_audit_logs.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # Update MySQL credentials in .env if needed
npm install
npm run dev
```
API runs at `http://localhost:5000/api`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000` (or `http://localhost:5173`)

