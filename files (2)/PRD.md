# Product Requirements Document (PRD)

## Project Name
Automation Workflow Dashboard

## Version
1.0.0

## Status
Planning

---

## 1. Overview

Automation Workflow Dashboard is a secure, full-stack web application (MERN) that enables teams to create, manage, execute, validate, and schedule automation workflows through a centralized interface.

Authenticated users can configure automation platforms, upload execution data files, trigger workflow runs, monitor real-time execution status, and analyze historical execution data through a modern, role-based dashboard.

---

## 2. Problem Statement

QA and automation teams often rely on scattered scripts, manual triggers, and disconnected logs to run and track automated workflows. This leads to:

- No centralized visibility into execution history
- Manual, error-prone scheduling
- Difficulty tracking failures and root causes
- No standardized access control across team roles

This project solves that by providing one dashboard to manage the full workflow lifecycle.

---

## 3. Objectives

- Provide centralized workflow management
- Allow upload of automation test data in multiple formats
- Execute workflows on-demand
- Schedule recurring workflow execution
- Track full execution history with logs
- Generate exportable reports
- Manage users with role-based permissions
- Ensure the system is secure, responsive, and scalable

---

## 4. Target Users & Roles

| Role | Description | Key Permissions |
|---|---|---|
| Administrator | Full system control | Manage users, roles, settings, all workflows |
| Project Manager | Oversight of workflows/reports | View all executions, generate reports, manage schedules |
| QA Engineer | Builds and validates workflows | Create/edit/execute/validate workflows |
| Tester | Executes and reviews assigned workflows | Run workflows, view logs, upload files |

---

## 5. Core Features

### 5.1 Authentication
- Login / Logout
- JWT-based session authentication
- Password hashing (bcrypt)
- Role-based access control (RBAC)
- Protected routes on frontend and backend

### 5.2 Dashboard
- Summary statistics: success rate, failed executions, average execution time
- Recent executions feed
- Active schedules widget
- Visual charts (executions over time, pass/fail ratio)

### 5.3 Workflow Management
- Create workflow
- Edit workflow
- Delete workflow
- Execute workflow on demand
- Validate workflow configuration before execution

### 5.4 File Upload
- Supported formats: CSV, XLSX, JSON, XML, TXT
- Max file size: 50MB
- File preview before execution
- Stored via Multer with metadata in MongoDB

### 5.5 Scheduling
- Daily, weekly, monthly recurring schedules
- Custom cron expression support
- Calendar view of upcoming runs
- Enable/disable/pause schedules

### 5.6 Reports
- Export execution history as PDF, CSV, or Excel
- Filter by date range, workflow, status, user

### 5.7 Logs
- Execution logs (step-by-step)
- Error logs (stack traces, failure reasons)
- Validation logs (pre-execution checks)

### 5.8 Settings
- Theme toggle (dark/light)
- Environment configuration (dev/staging/prod)
- Notification preferences (email/in-app)
- API key management for integrations

---

## 6. Non-Functional Requirements

| Requirement | Description |
|---|---|
| Responsive | Works on desktop, tablet, and mobile |
| Secure | JWT, bcrypt, input validation, RBAC, rate limiting |
| Fast | API response times under 300ms for standard queries |
| Scalable | Stateless backend, horizontally scalable |
| Accessible | WCAG 2.1 AA compliance for core flows |

---

## 7. Tech Stack

**Frontend:** React, Vite, React Router, Axios, Tailwind CSS
**Backend:** Node.js, Express
**Database:** MongoDB, Mongoose
**Authentication:** JWT, bcrypt
**Deployment:** Render (backend), Vercel (frontend), MongoDB Atlas (database)

---

## 8. Success Metrics

- 100% of workflows executable without manual script intervention
- < 1% failed executions due to system error (vs. workflow logic error)
- Full audit trail for every execution
- Onboarding a new user to run their first workflow in under 10 minutes

---

## 9. Out of Scope (v1.0)

- Multi-tenant / organization-level isolation
- Third-party CI/CD integration (Jenkins, GitHub Actions)
- Mobile native app
- Real-time collaborative editing of workflows

---

## 10. Assumptions

- Users have basic familiarity with automation workflow concepts
- Initial deployment supports a single organization/team
- English-only UI for v1.0
