# Full-Stack Application Constitution (Angular 21 + Java 21)

## Core Principles

### I. Standalone-First Frontend Architecture
- Angular MUST use standalone components (no NgModules).
- Application structure is feature-based, not layer-based.
- Each feature:
  - Owns its components, services, routes, and state
  - Is lazy-loadable by default
- Shared logic must live in clearly defined shared libraries.

---

### II. API-First & Contract-Driven Development
- Backend APIs MUST be defined using OpenAPI (Swagger) before implementation.
- Frontend integrates strictly via typed API clients (generated or strongly typed).
- Breaking API changes require versioning (`/api/v1`, `/api/v2`).
- No undocumented endpoints allowed.

---

### III. Test-First Development (NON-NEGOTIABLE)
- TDD workflow enforced:
  1. Write tests
  2. Confirm failing
  3. Implement
  4. Refactor

#### Frontend (Angular 21)
- Unit tests: Jest (preferred) or Karma
- Component tests: Angular Testing Library
- E2E: Playwright or Cypress

#### Backend (Java 21)
- Unit tests: JUnit 5
- Mocking: Mockito
- Integration: Spring Boot Test / Testcontainers

---

### IV. Reactive & Asynchronous Design
#### Frontend
- Use Signals (preferred) or RxJS where appropriate
- Avoid manual subscriptions when Signals can be used
- State must be predictable and traceable

#### Backend
- Prefer virtual threads (Project Loom, Java 21) for scalability
- Use asynchronous processing where beneficial
- Avoid blocking I/O where possible

---

### V. Integration & Contract Testing
- Mandatory for:
  - API contracts
  - Frontend ↔ Backend integration
  - Database migrations

- Tools:
  - Spring Cloud Contract / REST Assured
  - Testcontainers for DB realism
  - Mock API layer in Angular

---

### VI. Observability & Diagnostics
#### Backend
- Structured logging (SLF4J + Logback)
- Distributed tracing (OpenTelemetry)
- Metrics (Micrometer + Prometheus)

#### Frontend
- Centralized error handling
- Logging via interceptors
- Optional monitoring (Sentry / similar)

---

### VII. Versioning & Backward Compatibility
- Backend: Semantic Versioning
- APIs: Versioned endpoints
- Frontend must handle backward compatibility gracefully
- Breaking changes require:
  - Migration guide
  - Deprecation window

---

### VIII. Simplicity & Performance
- Follow YAGNI and KISS principles
- Prefer built-in Angular/Java features over heavy libraries
- Performance budgets:
  - Angular bundle size must be monitored
  - Backend response times must meet SLAs

---

## Technology & Architecture Constraints

### Frontend (Angular 21)
- Standalone APIs ONLY
- Signals for state (preferred over RxJS where applicable)
- Functional guards and resolvers
- Strict TypeScript mode enabled
- ESLint + Prettier enforced

### Backend (Java 21)
- Spring Boot 3+
- Virtual Threads enabled where applicable
- Spring Data JPA / Hibernate OR reactive stack (if chosen)
- Database: PostgreSQL (preferred)
- Build: Maven or Gradle

---

### Security Requirements
- Authentication: OAuth2 / JWT
- Authorization: Role-based (RBAC)
- Input validation required on all endpoints
- HTTPS enforced everywhere
- Sensitive data must never be logged

---

## Development Workflow

### Branch Naming (MANDATORY)
- Must follow:
  - `001-feature-name`
  - `002-bugfix-name`
  - `YYYYMMDD-description`

- Invalid branch names BLOCK all SpecKit operations.

---

### SpecKit Workflow (MANDATORY)
1. `/speckit.specify`
2. `/speckit.plan`
3. `/speckit.tasks`
4. `/speckit.analyze`

- No implementation before tasks.md exists
- Brownfield extensions must run before analysis (if configured)

---

### Code Review & Quality Gates
- PR requirements:
  - All tests passing
  - Linting clean
  - Reviewed by at least one developer

- CI must enforce:
  - Build success
  - Coverage thresholds
  - Static analysis

---

### Deployment
- Independent deployment:
  - Angular → CDN / Web server
  - Java → Containerized (Docker)

- Environments:
  - Dev → Staging → Production

- Feature flags encouraged

---

## Governance

- This Constitution overrides all informal practices
- All changes must comply or be explicitly justified
- Amendments require:
  - Documentation
  - Approval
  - Migration strategy

- Complexity must always be justified

---

**Version**: 2.0.0  
**Ratified**: 2026-04-29  
**Last Amended**: 2026-04-29