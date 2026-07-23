# Project Memory

> This is a living document. Update it as decisions are made, phases are completed, and conventions evolve.

---

## Project Name
Automation Workflow Dashboard

## Purpose
Enterprise dashboard for creating, managing, executing, validating, scheduling, and reporting on automation workflows.

---

## Tech Stack Snapshot

**Frontend:** React, Vite, React Router, Axios, Tailwind CSS
**Backend:** Node.js, Express
**Database:** MongoDB, Mongoose
**Authentication:** JWT, bcrypt
**Deployment (planned):** Render (backend), Vercel (frontend), MongoDB Atlas (database)

---

## Current Status
Planning

## Current Phase
Phase 1 — Architecture & Project Setup

## Modules Completed
None yet

## Upcoming Modules (in order)
1. Authentication
2. Dashboard
3. Workflow CRUD
4. File Upload
5. Execution Engine
6. Scheduling
7. Reports
8. Deployment

---

## Known Decisions

| Decision | Rationale |
|---|---|
| Dark theme as default | Matches target audience (engineers/QA), reduces eye strain for long monitoring sessions |
| REST API (not GraphQL) | Simpler to implement and maintain for this team's current skillset |
| JWT Authentication | Stateless, scalable, widely understood by the team |
| Role-Based Access Control | Needed to separate Admin/PM/QA/Tester permissions |
| Responsive Design | Dashboard must be usable on tablets for on-call monitoring |
| Max upload size: 50MB | Balances flexibility for large test datasets with server resource limits |
| Supported file types: CSV, JSON, XML, TXT, XLSX | Covers standard automation test data formats |

---

## Open Questions / Decisions Pending

- Will execution run synchronously or via a background job queue (e.g., BullMQ)?
- Real-time updates: polling vs. WebSockets for execution status?
- Will there be multi-tenant/organization support in a future version?

---

## Change Log

| Date | Change |
|---|---|
| TBD | Initial documentation suite created (PRD, ARCHITECTURE, DESIGN, RULES, MEMORY, PHASES, DATABASE, API, SECURITY) |

---

## Notes for Future Contributors

- Always check this file before starting new work — it reflects the most current project state.
- Update "Current Status," "Current Phase," and "Modules Completed" as work progresses.
- Log any major architectural or design decision here with a brief rationale, even if it's already documented elsewhere.
