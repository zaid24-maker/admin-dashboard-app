# API Specification

Base URL: `/api`

All protected routes require a valid JWT (via HttpOnly cookie or `Authorization: Bearer <token>` header).

---

## Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | Public (or Admin-only, per policy) |
| POST | `/auth/login` | Authenticate user, return JWT | Public |
| POST | `/auth/logout` | Invalidate session/cookie | Authenticated |
| GET | `/auth/me` | Get current authenticated user | Authenticated |

---

## Dashboard

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/dashboard` | Get aggregated dashboard statistics | Authenticated |

---

## Workflows

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/workflows` | List all workflows | Authenticated |
| GET | `/workflows/:id` | Get single workflow detail | Authenticated |
| POST | `/workflows` | Create new workflow | QA Engineer, Admin |
| PUT | `/workflows/:id` | Update workflow | QA Engineer, Admin |
| DELETE | `/workflows/:id` | Delete workflow | Admin |
| POST | `/workflows/run` | Execute a workflow | QA Engineer, Tester, Admin |
| POST | `/workflows/validate` | Validate workflow configuration | QA Engineer, Admin |

---

## File Upload

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/upload` | Upload a file (CSV/XLSX/JSON/XML/TXT, max 50MB) | Authenticated |
| GET | `/upload/:id` | Get file metadata | Authenticated |
| DELETE | `/upload/:id` | Delete uploaded file | Admin, uploader |

---

## Executions

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/executions` | List execution history (filterable) | Authenticated |
| GET | `/executions/:id` | Get single execution detail | Authenticated |

---

## Logs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/logs` | Get logs (filter by type/execution) | Authenticated |
| GET | `/logs/:executionId` | Get logs for a specific execution | Authenticated |

---

## Schedules

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/schedules` | List all schedules | Authenticated |
| POST | `/schedules` | Create a new schedule | QA Engineer, Admin, PM |
| PUT | `/schedules/:id` | Update a schedule | QA Engineer, Admin, PM |
| DELETE | `/schedules/:id` | Delete a schedule | Admin |

---

## Reports

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/reports` | Generate/export report (PDF/CSV/Excel) | Authenticated |

---

## Users (Admin)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/users` | List all users | Admin |
| POST | `/users` | Create a new user | Admin |
| PUT | `/users/:id` | Update user (role, status) | Admin |
| DELETE | `/users/:id` | Deactivate/delete user | Admin |

---

## Settings

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/settings` | Get current settings | Authenticated |
| PUT | `/settings` | Update settings (theme, notifications, env) | Authenticated |

---

## Response Format (Standard)

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descriptive error message"
  }
}
```

---

## Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role permissions) |
| 404 | Resource not found |
| 500 | Internal server error |
