# System Architecture

## 1. High-Level Architecture

```
Client (React SPA)
      |
      v
   Axios (HTTP layer)
      |
      v
Express REST API
      |
      v
Middleware (auth, validation, error handling)
      |
      v
Controllers (request/response handling)
      |
      v
Services (business logic)
      |
      v
Mongoose Models
      |
      v
MongoDB Atlas
```

Each layer has a single responsibility:
- **Controllers** parse requests and return responses — no business logic.
- **Services** contain all business logic and orchestrate data operations.
- **Models** define schema and data access via Mongoose.

---

## 2. Folder Structure

### Client (`/client`)

```
client/
├── src/
│   ├── components/       # Reusable UI components (buttons, cards, modals)
│   ├── layouts/          # Page layouts (DashboardLayout, AuthLayout)
│   ├── pages/             # Route-level pages
│   ├── hooks/             # Custom React hooks
│   ├── context/           # Global state (Auth context, Theme context)
│   ├── services/          # Axios API call wrappers
│   ├── utils/              # Helper functions
│   ├── assets/             # Images, icons, static files
│   ├── routes/             # Route definitions & protected route logic
│   ├── App.jsx
│   └── main.jsx
├── index.html
└── vite.config.js
```

### Server (`/server`)

```
server/
├── config/                # DB connection, env config
├── controllers/           # Route handlers
├── middleware/             # Auth guard, error handler, upload handler
├── models/                  # Mongoose schemas
├── routes/                  # Express route definitions
├── services/                # Business logic layer
├── uploads/                  # Temporary file storage
├── utils/                     # Helper functions (logger, cron helpers)
└── server.js                  # Entry point
```

---

## 3. Authentication Flow

```
User submits credentials
        |
        v
Backend validates & issues JWT
        |
        v
Token stored (HttpOnly cookie preferred)
        |
        v
Frontend attaches token to Axios requests
        |
        v
Middleware verifies token on protected routes
        |
        v
Access granted based on role (RBAC)
        |
        v
Dashboard rendered
```

---

## 4. Request Lifecycle Example (Execute Workflow)

1. User clicks "Run" on a workflow card in React.
2. Axios sends `POST /api/workflows/run` with workflow ID and JWT.
3. Auth middleware verifies token and attaches `req.user`.
4. Controller receives request, calls `workflowService.execute()`.
5. Service validates workflow config, triggers execution engine.
6. Execution result and logs are saved via `Execution` and `Log` models.
7. Response returned to controller, then to client.
8. React updates dashboard state and shows execution status in real time (polling or WebSocket, depending on implementation phase).

---

## 5. Core Modules

| Module | Responsibility |
|---|---|
| Authentication | Login, registration, JWT issuance, session handling |
| Dashboard | Aggregated statistics and summaries |
| Workflow | CRUD + execution + validation of workflows |
| Executions | Tracks each workflow run and its result |
| Schedules | Cron-based recurring execution management |
| Logs | Execution, error, and validation log storage/retrieval |
| Reports | Report generation and export |
| Users | User management and role assignment |
| Integrations | External platform/API key configuration |
| Settings | App-level and user-level preferences |

---

## 6. Data Flow Principles

- Frontend **never** talks to MongoDB directly — all data access goes through the REST API.
- All business logic lives in the **service layer**, not controllers or routes.
- All mutations are validated both on the client (UX) and server (source of truth).
- Long-running executions should be handled asynchronously (queue or background job) rather than blocking the request/response cycle.

---

## 7. Scalability Considerations

- Stateless Express API — enables horizontal scaling behind a load balancer.
- MongoDB Atlas handles replication and sharding as data grows.
- File uploads stored temporarily and processed, then archived or purged based on retention policy.
- Scheduled jobs (node-cron) should eventually move to a dedicated job queue (e.g., BullMQ + Redis) if execution volume grows significantly.
