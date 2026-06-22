# Enterprise Security Architecture

## Multi-Tenant Isolation
- **Row-Level Security (RLS)**: Enforced via PostgreSQL policies and Prisma Middleware.
- **Tenant Context Injection**: Every HTTP request resolves the 	enantId from the subdomain and injects it into an AsyncLocalStorage context. Prisma queries automatically filter by 	enantId.
- **Zero Data Leakage**: Automated CI tests ensure 	enantId cannot be overridden in POST/PUT bodies.

## OWASP Top 10 Mitigation
1. **Broken Access Control**: Addressed via strict Role-Based Access Control (RBAC) middleware verifying JWT claims against requested resource 	enantId.
2. **Cryptographic Failures**: AES-256 for data at rest. TLS 1.3 enforced for all data in transit. bcrypt for password hashing (cost factor 12).
3. **Injection**: Prisma ORM provides automatic parameterized queries, neutralizing SQL injection vectors.
4. **Security Misconfiguration**: Infrastructure as Code (Terraform) enforces secure-by-default configurations.
5. **Authentication Failures**: Short-lived JWTs (15 min) + secure HTTP-only refresh tokens. Rate-limiting on login endpoints.

## Application Hardening
- **Helmet**: Enforces HSTS, prevents clickjacking (X-Frame-Options: DENY), disables X-Powered-By.
- **CORS**: Strictly whitelisted origins mapped dynamically to registered tenant subdomains.
- **Rate Limiting**: express-rate-limit prevents DDoS and brute force on critical endpoints.