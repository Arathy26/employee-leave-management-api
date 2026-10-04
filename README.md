# Employee Leave Management API

A headless REST API for managing employees, leave types, and leave requests, built with **NestJS**, **Prisma**, and **PostgreSQL**, and fully documented and testable through **Swagger UI**.

There is no frontend and no authentication, by design. The project focuses on backend architecture, REST API design, business rules, validation, and relational data modelling.

---

## Tech Stack

| Technology | Role |
| --- | --- |
| NestJS + TypeScript | Backend framework and language |
| PostgreSQL | Relational database |
| Prisma | ORM and database migrations |
| Swagger UI / OpenAPI | Interactive API documentation and testing |
| class-validator / ValidationPipe | Request (DTO) validation |

---

## Features

- Employee CRUD
- Leave type CRUD (each type has an annual limit)
- Submit leave requests with full business-rule validation
- Approve or reject pending leave requests
- View an employee's leave history
- Calculate an employee's leave balance dynamically (no separate balance table)

---

## Architecture

The project uses a layer-based, MVC-inspired architecture. Because the API is headless, there is no View layer. Swagger UI is a testing interface, not part of the application.

```
Client / Swagger UI
        ↓  HTTP request
DTO + ValidationPipe   → validates incoming data
        ↓
Controller             → handles HTTP routes only
        ↓
Service                → business rules and calculations
        ↓
PrismaService          → centralized database access
        ↓
PostgreSQL             → employees • leave_types • leave_requests
```

**Core rule:** the controller handles HTTP, the service handles business logic, DTOs handle input validation, and Prisma handles database access.

---

## Folder Structure

```
src/
├── controllers/     # HTTP routes (Employee, LeaveType, LeaveRequest)
├── services/        # Business logic
├── dto/             # Request contracts and validation
├── modules/         # NestJS dependency-injection wiring
├── prisma/          # PrismaService + PrismaModule
├── app.module.ts
└── main.ts          # Bootstrap, global ValidationPipe, Swagger setup
prisma/
├── schema.prisma    # Database models and relations
└── migrations/
```

---

## Database Design

There are exactly three tables.

```
employees (1) ──────< (many) leave_requests (many) >────── (1) leave_types
```

| Table | Key fields |
| --- | --- |
| `employees` | id, employee_code (unique), name, email (unique), department, joining_date, created_at, updated_at |
| `leave_types` | id, name (unique), description, annual_limit, created_at, updated_at |
| `leave_requests` | id, employee_id (FK), leave_type_id (FK), start_date, end_date, reason, status, created_at, updated_at |

**LeaveStatus enum:** `PENDING` | `APPROVED` | `REJECTED`

---

## Business Rules

When a leave request is submitted:

1. The employee must exist.
2. The leave type must exist.
3. `start_date` must not be after `end_date`.
4. The requested leave duration is calculated from the dates.
5. The request must not overlap an existing `PENDING` or `APPROVED` request for the same employee.
6. The request must not exceed the employee's available annual balance for that leave type.
7. New requests start as `PENDING`.

For approval and rejection:

- Only `PENDING` requests can be approved or rejected.
- Approve: `PENDING → APPROVED`
- Reject: `PENDING → REJECTED`

**Leave balance** is calculated dynamically: the leave type's `annual_limit` minus the approved leave days. It is never stored, so it cannot go out of sync with the actual requests.

---

## API Endpoints (17)

### Employees
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/employees` | Create an employee |
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Get an employee by ID |
| PATCH | `/api/employees/:id` | Update an employee |
| DELETE | `/api/employees/:id` | Delete an employee |

### Leave Types
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/leave-types` | Create a leave type |
| GET | `/api/leave-types` | List all leave types |
| GET | `/api/leave-types/:id` | Get a leave type by ID |
| PATCH | `/api/leave-types/:id` | Update a leave type |
| DELETE | `/api/leave-types/:id` | Delete a leave type |

### Leave Requests
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/leave-requests` | Submit a leave request |
| GET | `/api/leave-requests` | List all leave requests |
| GET | `/api/leave-requests/:id` | Get a leave request by ID |
| PATCH | `/api/leave-requests/:id/approve` | Approve a pending request |
| PATCH | `/api/leave-requests/:id/reject` | Reject a pending request |
| GET | `/api/leave-requests/employee/:employeeId` | An employee's leave history |
| GET | `/api/leave-requests/employee/:employeeId/balance` | An employee's leave balance |

---

## Getting Started

### Prerequisites
- Node.js (LTS)
- PostgreSQL running locally
- npm

### 1. Clone the repository
```bash
git clone https://github.com/Arathy26/employee-leave-management-api.git
cd employee-leave-management-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env` and fill in your PostgreSQL details:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/employee_leave_db"
```

### 4. Run database migrations
```bash
npx prisma migrate dev
```

### 5. Start the application
```bash
npm run start:dev
```

### 6. Open Swagger UI
```
http://localhost:3000/api
```

---

## Error Handling

| Situation | Status |
| --- | --- |
| Invalid request body (fails DTO validation) | 400 Bad Request |
| Start date after end date / insufficient balance | 400 Bad Request |
| Employee, leave type, or request not found | 404 Not Found |
| Overlapping leave / duplicate unique field | 409 Conflict |
| Approving or rejecting a non-pending request | 400 Bad Request |

---

## Demo Flow (via Swagger UI)

1. Create two employees.
2. Create three leave types.
3. Submit a valid leave request (it is saved as `PENDING`).
4. Submit an overlapping request, which is rejected.
5. Approve one request and reject another.
6. View the employee's leave history and balance.
7. Try invalid IDs, invalid dates, and a request that exceeds the balance to see the error handling.

---

## Out of Scope

Frontend UI, authentication/JWT, role-based access, notifications, payroll/attendance, holiday calendar, separate balance table, microservices, and queues.

---

## Author

**Arathy Rajeev**, AI Engineering Intern