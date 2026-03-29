# Reimbursement Management System - Backend

The backend of the Reimbursement Management System is a robust Express.js application designed to handle multi-role expense claims, multi-level approval workflows, OCR-based receipt scanning, and automatic currency conversion.

## 🚀 Key Features

- **Multi-Role RBAC**: Built-in support for Admin, Manager, and Employee roles with specific permission levels.
- **Dynamic Approval Engine**:
  - Sequential multi-level approval steps.
  - Conditional logic: Percentage-based threshold, specific approver overrides, and hybrid rules.
- **OCR Integration**: Powered by Tesseract.js to automatically extract amount, date, merchant, and category from uploaded receipts.
- **Multi-Currency Support**: Automated conversion from expense currency to company default currency using the Frankfurter API.
- **Audit Logging**: Full history of all approval/rejection actions for every expense.
- **Analytics API**: Real-time aggregation of spending trends, monthly totals, and status counts for the dashboard.

## 🛠️ Tech Stack

- **Framework**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs for password hashing
- **File Handling**: Multer for receipt storage
- **OCR**: Tesseract.js for image-to-text processing
- **Validation**: express-validator for strict schema enforcement
- **Logging**: Morgan and custom Winston-based logger

## 📁 Project Structure

```bash
backend/
├── src/
│   ├── app.js            # Express app configuration
│   ├── server.js         # Entry point (cluster & server start)
│   ├── config/           # DB & Environment config
│   ├── controllers/      # Route handlers (Business logic)
│   ├── routes/           # REST endpoints
│   ├── models/           # Mongoose schemas
│   ├── middlewares/      # Auth, uploads, and error handling
│   ├── services/         # Reusable logic (OCR, FX, etc.)
│   ├── validators/       # Input validation schemas
│   ├── utils/            # Helpers (API response, logging)
│   └── seed/             # Data seeding script
└── uploads/              # Local storage for receipt images
```

## 🚥 Getting Started

### 1. Installation
```powershell
pnpm install
```

### 2. Environment Variables
Create a `.env` file in the root based on `.env.example`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
EXCHANGE_API_BASE_URL=https://api.frankfurter.app
COUNTRY_API_BASE_URL=https://restcountries.com/v3.1
```

### 3. Run Development Server
```powershell
pnpm dev
```

### 4. Seed Demo Data
Populate the database with a pre-configured company, users, and workflows:
```powershell
pnpm seed
```

## 📡 API Endpoints Summary

### Authentication
- `POST /api/v1/auth/signup` - Register company and admin
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Current user profile

### User Management (Admin Only)
- `GET /api/v1/users/` - List all company users
- `POST /api/v1/users/` - Create a new user (Manager/Employee)
- `PATCH /api/v1/users/:id/role` - Update user role & manager

### Expenses
- `POST /api/v1/expenses/` - Submit a new expense
- `GET /api/v1/expenses/` - List expenses (role-filtered)
- `GET /api/v1/expenses/stats` - Analytics data for cards
- `DELETE /api/v1/expenses/:id` - Cancel a pending expense

### Approvals
- `GET /api/v1/approvals/pending` - Review pending queue (Manager/Admin)
- `POST /api/v1/approvals/:id/approve` - Approve step
- `GET /api/v1/approvals/:id/logs` - Full audit trail

### OCR
- `POST /api/v1/ocr/scan` - Process image and extract metadata
