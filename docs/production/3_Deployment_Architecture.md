# Deployment Architecture & CI/CD

## CI/CD Pipeline Stages
We utilize GitHub Actions for a zero-downtime Continuous Integration / Continuous Deployment pipeline.

### 1. Pre-Integration
- **Linting & Formatting**: ESLint and Prettier enforce code consistency.
- **Unit Testing**: Jest runs backend services, validations, and auth tests (Requirement: >90% coverage).
- **Security Scans**: Trivy scans Docker images. Dependabot monitors npm packages.

### 2. Integration
- **Integration Tests**: Supertest runs against a spun-up PostgreSQL test container to verify database interactions, authentication flows, and fee calculations.
- **Build**: Vite builds the frontend production bundle. TypeScript compiles the backend.

### 3. Deployment
- **Container Registry**: Docker images pushed to AWS ECR.
- **Blue/Green Deployment**: New ECS/EKS tasks are spun up. ALB routes traffic to green nodes only after health checks (/api/health) pass. Old tasks are drained safely.

## Horizontal Scaling Strategy
- **Trigger**: Target CPU Utilization > 70% OR HTTP Request Latency > 250ms.
- **Action**: Auto Scaling Group spins up new Node.js instances.
- **Database Read Replicas**: High volume read queries (e.g., viewing report cards) are offloaded to read replicas to preserve primary node IOPS for transactions.