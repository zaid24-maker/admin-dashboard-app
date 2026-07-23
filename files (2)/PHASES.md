# Development Roadmap

## Phase 1 — Project Setup
- Initialize client (Vite + React) and server (Express) projects
- Set up folder structure per ARCHITECTURE.md
- Configure MongoDB Atlas connection
- Set up ESLint, Prettier, environment variables
- Implement Authentication (JWT, bcrypt)
- Implement Protected Routes (frontend + backend middleware)

## Phase 2 — Dashboard UI
- Build Sidebar and Navbar
- Build Dashboard layout
- Build Statistics Cards (success rate, failed executions, avg time, active schedules)
- Connect dashboard to placeholder/mock data

## Phase 3 — Workflow CRUD
- Build Workflow model and API endpoints (Create, Read, Update, Delete)
- Build Workflow list and detail UI
- Implement platform selection within workflow config
- Implement workflow validation logic

## Phase 4 — File Upload
- Integrate Multer for file handling
- Support CSV, XLSX, JSON, XML, TXT (up to 50MB)
- Build file preview component
- Store file metadata in MongoDB

## Phase 5 — Execution Engine
- Build "Run Workflow" functionality
- Create Execution model to track each run
- Build Execution History UI
- Implement Execution, Error, and Validation logs

## Phase 6 — Scheduler
- Integrate node-cron for scheduled execution
- Support daily, weekly, monthly, and custom cron expressions
- Build calendar view for upcoming scheduled runs
- Allow enabling/disabling/pausing schedules

## Phase 7 — Reports
- Build report generation logic (PDF, CSV, Excel export)
- Add filtering (date range, workflow, status, user)
- Build charts for execution trends (Recharts or similar)

## Phase 8 — User Management
- Build user list, invite, and role assignment UI
- Implement Role-Based Access Control across all modules
- Restrict routes/actions based on role

## Phase 9 — Settings & Integrations
- Build Settings page (theme, environment, notifications, API keys)
- Build Integrations page for external automation platform configs

## Phase 10 — Testing, Optimization & Deployment
- Write unit and integration tests (backend and frontend)
- Performance audit (API response times, bundle size)
- Security audit (see SECURITY.md checklist)
- Deploy: frontend to Vercel, backend to Render, database on MongoDB Atlas
- Final QA pass and production launch
