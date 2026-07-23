# Security Guide

## 1. Authentication

- JWT used for session authentication.
- Tokens signed with a strong secret stored in environment variables (never hardcoded).
- Prefer HttpOnly, Secure, SameSite cookies for token storage over localStorage to mitigate XSS-based token theft.
- Token expiration set to a reasonable window (e.g., 1 hour access token, refresh token strategy for longer sessions).

## 2. Password Security

- All passwords hashed using bcrypt (minimum 10 salt rounds) before storage.
- Plaintext passwords are never logged, stored, or transmitted outside the initial login request (over HTTPS only).
- Enforce minimum password complexity on registration/reset.

## 3. Transport Security

- All traffic served over HTTPS in production.
- HTTP Strict Transport Security (HSTS) enabled at the hosting/CDN level.

## 4. HTTP Security Headers

- Use **Helmet** middleware to set secure HTTP headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, etc.).

## 5. Rate Limiting

- Apply rate limiting on sensitive endpoints (`/auth/login`, `/auth/register`, password reset) to mitigate brute-force attacks.
- Consider a global API rate limit to prevent abuse.

## 6. Input Validation

- All incoming request bodies/params/queries validated server-side (e.g., via Joi, Zod, or express-validator) regardless of client-side validation.
- Reject unexpected fields; whitelist expected input shapes.

## 7. Injection Protection

- Use Mongoose schemas/parameterized queries to prevent MongoDB injection (avoid raw `$where` queries with user input).
- Sanitize inputs used in dynamic queries (e.g., via `express-mongo-sanitize`).

## 8. Cross-Site Scripting (XSS) Protection

- Sanitize any user-generated content rendered in the UI.
- React escapes output by default — avoid `dangerouslySetInnerHTML` unless content is sanitized.

## 9. CORS

- Restrict CORS to known frontend origins (no wildcard `*` in production).
- Explicitly allow only required HTTP methods and headers.

## 10. Role-Based Access Control (RBAC)

- Every protected route checks both authentication (valid JWT) and authorization (role permission) before processing the request.
- Sensitive actions (user management, workflow deletion) restricted to Admin role only.

## 11. File Upload Security

- Restrict accepted file types (CSV, XLSX, JSON, XML, TXT) at both extension and MIME-type level.
- Enforce max file size (50MB) at the middleware level (Multer limits).
- Store uploaded files outside the public web root; scan/validate before processing.

## 12. Audit Logging

- Log key security-relevant events: login attempts (success/failure), role changes, workflow deletions, user management actions.
- Logs should be immutable/append-only where possible and exclude sensitive data (passwords, tokens).

## 13. Environment & Secrets Management

- All secrets (DB URI, JWT secret, third-party API keys) stored in environment variables, never committed to version control.
- Provide `.env.example` with placeholder keys; add `.env` to `.gitignore`.

## 14. Dependency Security

- Regularly run `npm audit` and update dependencies with known vulnerabilities.
- Pin dependency versions in `package-lock.json` / use Dependabot or similar for automated updates.

## 15. Pre-Production Security Checklist

- [ ] All endpoints require authentication where appropriate
- [ ] RBAC enforced on every sensitive route
- [ ] Passwords hashed, never logged
- [ ] Helmet, CORS, and rate limiting configured
- [ ] Input validation on all POST/PUT routes
- [ ] File upload size/type restrictions enforced
- [ ] Secrets stored in environment variables only
- [ ] HTTPS enforced in production
- [ ] Dependency vulnerabilities checked (`npm audit`)
- [ ] Audit logs in place for sensitive actions
