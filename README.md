# Smart Employee Management System (Smart EMS)

A modern, full-stack, enterprise-grade Employee Management System engineered with **React 18, TypeScript, Tailwind CSS, Node.js Express (ES Modules), and MongoDB Atlas**. Built following professional architectural patterns, strict role-based access control (RBAC), and automated testing.

---

## 1. Project Overview & Features

### Core Modules:
- **Workforce Intelligence Dashboard:** Real-time data-driven KPI cards (Total, Active, Inactive, On Leave, Pending Leaves), department allocation graphs, employment type distribution, recent hires list, and an access-restricted executive payroll summary.
- **Employee Management (Full CRUD):**
  - Auto-generated unique Employee IDs (e.g., `EMP-1001`).
  - Searchable by name, employee ID, email, or department.
  - Multi-criteria filtering by department, status, and employment type.
  - Pagination, sorting, and field-level validation (Zod schemas).
  - Deletion safeguards with cascade cleanup for linked attendance/leaves and manager reassignment.
  - Sensitive salary protection (visible only to Admin and HR Manager).
- **Department Management:**
  - Create, view, edit, and safely delete departments.
  - Live employee headcount aggregation for each department.
  - Department deletion blocker: strictly prevents deleting any department while active employees are assigned to it.
- **Attendance Tracking:**
  - Daily check-in and check-out tracking with automated work-hour calculations.
  - Supports `Present`, `Late`, `Absent`, and `On Leave`.
  - Database-enforced compound index preventing duplicate entries for the same employee and calendar date.
- **Leave Management & PTO Workflows:**
  - Request submission for Annual, Sick, Casual, Maternity, Paternity, and Unpaid leave.
  - Automatic date range validation, day-count calculation, and overlapping request prevention.
  - Manager / Admin approval & rejection workflow with review notes.
  - Immutable audit trail recording all leave decisions with timestamp and reviewer details.
- **Reports & Exporting:**
  - Department workforce distribution report.
  - Attendance summary analytics (total hours, daily averages).
  - Full employee directory report.
  - Role-aware CSV export (safely strips compensation fields for non-privileged viewers).
- **Security & Authentication:**
  - JSON Web Tokens (JWT) with HTTP-only cookies and Bearer fallback.
  - Password hashing with `bcryptjs` (salt rounds 10).
  - Role-Based Access Control (`Admin`, `HR Manager`, `Employee`).
  - Rate limiting on authentication endpoints to prevent brute-force attacks.
  - Security headers with `helmet` and CORS protection.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS, Lucide React, React Router v6, Axios |
| **Backend** | Node.js (v20+), Express.js (ES Modules), Mongoose 8, Zod 3, Helmet, CORS, Cookie-Parser, BcryptJS, JWT |
| **Database** | MongoDB Atlas (Cloud persistent database) |
| **Testing** | Node native test runner (`node:test`, `node:assert`), Supertest, MongoMemoryServer (isolated automated tests) |

---

## 3. Folder Structure

```
smart-employee-mgmt-system/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── types/              # Domain models & interfaces
│       ├── services/           # Axios API services (auth, employees, depts, etc.)
│       ├── context/            # AuthContext & Session management
│       ├── layouts/            # DashboardLayout & ProtectedRoute
│       ├── components/
│       │   ├── common/         # Navbar, Sidebar, Modal, ConfirmDialog, Pagination, StatusBadge
│       │   └── employees/      # EmployeeModal, EmployeeTable
│       └── pages/              # Login, Dashboard, Employees, Details, Departments, Attendance, Leaves, Reports
├── server/                     # Node.js + Express (ES Modules) Backend
│   ├── package.json
│   ├── index.js                # Server entry point & graceful shutdown
│   ├── app.js                  # Express middleware & route setup
│   ├── .env.example
│   ├── config/
│   │   ├── env.js              # Environment validation & zero-credential logging
│   │   └── db.js               # MongoDB Atlas connection handler
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & role authorization
│   │   ├── errorHandler.js     # Centralized error handler (404, Zod, Mongoose 11000)
│   │   └── validate.js         # Zod schema validation middleware
│   ├── models/                 # User, Employee, Department, Attendance, LeaveRequest, AuditLog
│   ├── routes/                 # Health, Auth, Employees, Departments, Attendance, Leaves, Dashboard, Reports
│   ├── controllers/            # Controller business logic
│   ├── validators/             # Zod validation schemas
│   ├── scripts/
│   │   └── seedAdmin.js        # Safe initial administrator provisioner
│   └── tests/                  # Integration test suite (33 passing tests)
├── .gitignore
├── package.json                # Root workflow scripts
└── README.md
```

---

## 4. Prerequisites

- **Node.js**: v20.x or v22.x or v24.x installed. (Check with `node -v`).
- **npm**: v9+ (Check with `npm.cmd -v` on Windows).
- **MongoDB Atlas Account**: Free Tier (M0) or local MongoDB instance.
- **PowerShell**: Windows PowerShell 5.1 or PowerShell 7.

---

## 5. MongoDB Atlas Setup Guide

To connect the application to MongoDB Atlas, follow these steps:

### 1. Create a Cluster
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Create** to deploy a new database.
3. Choose the **M0 Free Tier**, select your preferred cloud provider and region, and click **Create Cluster**.

### 2. Create a Database User
1. Under the **Security** section in the left sidebar, click **Database Access**.
2. Click **Add New Database User**.
3. Choose **Password** authentication.
4. Set a Username (e.g. `ems_admin`) and a strong Password. (Avoid special characters in the password that require URL-encoding, or encode them properly).
5. Under Database User Privileges, select **Read and write to any database**.
6. Click **Add User**.

### 3. Configure Network Access Securely
1. Under **Security**, click **Network Access**.
2. Click **Add IP Address**.
3. For local development, click **Add Current IP Address** (or `0.0.0.0/0` if your ISP IP changes frequently).
4. Click **Confirm**.

### 4. Obtain the Application Connection String
1. In the **Database Deployments** page, click **Connect** on your cluster.
2. Select **Drivers** (Node.js).
3. Copy the SRV connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 5. Set the Connection String Locally
1. In `server/`, copy `.env.example` to `.env`:
   ```powershell
   Copy-Item server\.env.example server\.env
   ```
2. Open `server/.env` and insert your credentials and database name:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://ems_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart_ems?retryWrites=true&w=majority
   CLIENT_ORIGIN=http://localhost:5173
   JWT_SECRET=super_secret_jwt_random_key_min_32_chars_long
   JWT_EXPIRES_IN=1d
   ```

### 6. Verify the Database Connection
Start the server and visit the health endpoint:
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/health
```
Response:
```json
{
  "success": true,
  "status": "healthy",
  "database": {
    "status": "connected",
    "connected": true
  }
}
```

---

## 6. Windows PowerShell Instructions

> **Note on PowerShell Script Execution:**
> If Windows PowerShell restricts running `.ps1` files (`execution policy`), always use `npm.cmd` instead of `npm`.

### Single Command: Start Everything (Recommended)
You can launch both the Express backend and the Vite frontend simultaneously with live logs from the project root:

```powershell
cd C:\Users\faris\.gemini\antigravity\scratch\smart-employee-mgmt-system
npm.cmd run dev
```

---

### Alternative: Separate Terminals

#### Terminal 1: Backend Server Setup

```powershell
# 1. Navigate to the server directory
cd C:\Users\faris\.gemini\antigravity\scratch\smart-employee-mgmt-system\server

# 2. Start the Express API server
npm.cmd run dev
```
*Backend runs on `http://localhost:5000`.*

---

#### Terminal 2: Frontend Client Setup

```powershell
# 1. Navigate to the client directory
cd C:\Users\faris\.gemini\antigravity\scratch\smart-employee-mgmt-system\client

# 2. Start the Vite development server
npm.cmd run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 7. Automated Testing & Verification

The backend includes a comprehensive integration test suite running on Node's native test runner (`node:test`) and an isolated memory database fixture (`MongoMemoryServer`):

```powershell
cd C:\Users\faris\.gemini\antigravity\scratch\smart-employee-mgmt-system\server
$env:NODE_ENV="test"
npm.cmd test
```

### Test Suite Summary:
- **Health Check & Foundational Middleware** (Health endpoint, CORS, 404 handler)
- **Employee & Department CRUD** (Auto ID generation, duplicate email check, duplicate department name check, department delete prevention with assigned staff)
- **Authentication & RBAC** (JWT authentication, role permissions, admin user creation)
- **Attendance & Leave Workflows** (Duplicate attendance prevention for employee/date, overlapping leave requests, approval audit log)
- **Dashboard Aggregations** (Real-time MongoDB counts, compensation data access restrictions)

**Result:** `33 passing tests (0 failures)`.

---

## 8. Frontend Production Build

To verify and generate an optimized production bundle:

```powershell
cd C:\Users\faris\.gemini\antigravity\scratch\smart-employee-mgmt-system\client
npm.cmd run build
```
*Build output: `client/dist/` (HTML, CSS, Minified JS).*

---

## 9. API Endpoint Reference

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System status and database health check |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Authenticate user & issue session cookie |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate session & clear cookie |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated profile |
| `POST` | `/api/auth/users` | Admin only | Create new user account |
| `GET` | `/api/employees` | Authenticated | List employees (search, filter, paginate) |
| `GET` | `/api/employees/:id` | Authenticated | Get detailed employee profile |
| `POST` | `/api/employees` | Admin / HR Manager | Create a new employee |
| `PUT` | `/api/employees/:id` | Admin / HR Manager | Update employee information |
| `DELETE` | `/api/employees/:id` | Admin / HR Manager | Delete employee record & cascade cleanup |
| `GET` | `/api/departments` | Authenticated | List departments with employee count |
| `POST` | `/api/departments` | Admin / HR Manager | Create new department |
| `PUT` | `/api/departments/:id` | Admin / HR Manager | Update department information |
| `DELETE` | `/api/departments/:id` | Admin / HR Manager | Delete department (blocked if staff assigned) |
| `GET` | `/api/attendance` | Authenticated | List attendance records (scoped by role) |
| `POST` | `/api/attendance` | Admin / HR Manager | Record daily attendance (duplicate check) |
| `GET` | `/api/leaves` | Authenticated | List leave requests (scoped by role) |
| `POST` | `/api/leaves` | Authenticated | Submit leave request |
| `PATCH` | `/api/leaves/:id/review` | Admin / HR Manager | Approve or reject leave request |
| `GET` | `/api/dashboard/summary` | Authenticated | Dashboard workforce metrics |
| `GET` | `/api/reports/directory` | Authenticated | Directory report |
| `GET` | `/api/reports/departments` | Authenticated | Department allocation report |
| `GET` | `/api/reports/attendance-summary` | Authenticated | Attendance statistics report |
| `GET` | `/api/reports/export-csv` | Admin / HR Manager | Download sanitized workforce CSV |

---

## 10. Role-Based Permissions Matrix

| Feature / Action | Admin | HR Manager | Employee |
|---|:---:|:---:|:---:|
| View Dashboard & General Counts | Yes | Yes | Yes |
| View Executive Payroll Analytics | Yes | Yes | Restricted |
| Create / Edit / Delete Employees | Yes | Yes | View Only |
| View Employee Salaries | Yes | Yes | Restricted |
| Create / Edit / Delete Departments | Yes | Yes | View Only |
| Record Daily Attendance | Yes | Yes | View Personal |
| Submit Leave Requests | Yes | Yes | Yes (Self) |
| Approve / Reject Leave Requests | Yes | Yes | No |
| Create New System User Accounts | Yes | No | No |
| Export Data to CSV | Yes | Yes | No |

---

## 11. Troubleshooting Common Errors

1. **PowerShell `npm : File ... cannot be loaded because running scripts is disabled`**:
   - **Solution:** Execute PowerShell commands using `npm.cmd` instead of `npm`, e.g., `npm.cmd run dev`.
2. **`Database connection failed: MONGODB_URI is not set`**:
   - **Solution:** Verify that `server/.env` exists and has `MONGODB_URI` populated with your Atlas SRV string.
3. **`MongoServerError: bad auth : authentication failed`**:
   - **Solution:** Check the username and password in `server/.env`. Make sure you are using Database User credentials (from Database Access), not your Atlas web login password.
4. **`Cannot delete department 'Engineering' because X employee(s) are assigned`**:
   - **Solution:** Reassign the employees in that department to another department first via the Employee Directory.
5. **CORS error in browser console**:
   - **Solution:** Ensure `CLIENT_ORIGIN` in `server/.env` matches `http://localhost:5173`.
