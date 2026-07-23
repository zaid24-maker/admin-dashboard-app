# Development Rules

## 1. React (Frontend)

- Always use functional components with Hooks — no class components.
- Never use inline CSS (`style={{}}`) — use Tailwind CSS utility classes.
- Every reusable UI element belongs in `components/`; every route-level view belongs in `pages/`.
- All API calls must go through the `services/` layer using Axios — never call `fetch` directly inside components.
- Use `context/` for global state (auth, theme) — avoid prop drilling beyond 2 levels.
- Keep components small and single-purpose; extract logic into custom hooks when it grows complex.
- Use PropTypes or TypeScript types for all component props (if/when TypeScript is adopted).

## 2. Node/Express (Backend)

- Controllers must stay thin — only handle request parsing and response formatting.
- All business logic belongs in the **Services** layer, never in controllers or routes.
- Use `async/await` exclusively — no unhandled Promise chains.
- Every async function must be wrapped in try/catch or handled by a centralized error-handling middleware.
- Never use `console.log` in production code — use a proper logger (e.g., Winston or Pino).
- Follow REST naming conventions:
  - `GET /resource` — list
  - `GET /resource/:id` — single item
  - `POST /resource` — create
  - `PUT /resource/:id` — update
  - `DELETE /resource/:id` — delete

## 3. Database

- Never access MongoDB directly from the frontend — all data flows through the REST API.
- All backend inputs must be validated (e.g., using Joi, Zod, or express-validator) before reaching the database layer.
- Passwords must always be hashed using bcrypt before storage — never store plaintext passwords.

## 4. Authentication & Security

- JWT should be stored in HttpOnly, Secure cookies where possible rather than localStorage, to reduce XSS token theft risk.
- Every protected route must verify the JWT and check role permissions via middleware.
- Rate-limit sensitive endpoints (login, password reset).

## 5. Environment & Configuration

- All secrets and environment-specific values (DB URI, JWT secret, API keys) must live in environment variables (`.env`), never hardcoded.
- Provide a `.env.example` file with placeholder keys for onboarding.

## 6. Git Workflow

- Commit frequently with clear, descriptive messages (conventional commits recommended: `feat:`, `fix:`, `chore:`, `docs:`).
- Use feature branches; avoid direct commits to `main`.
- Open pull requests for review before merging, even in small teams.

## 7. Code Quality

- Use ESLint for linting — no unresolved lint errors in committed code.
- Use Prettier for consistent code formatting.
- Write meaningful variable and function names — avoid abbreviations that aren't self-explanatory.

## 8. Error Handling

- All errors must be handled gracefully — no unhandled promise rejections or uncaught exceptions.
- User-facing error messages should be clear and non-technical; detailed errors go to logs, not the UI.
