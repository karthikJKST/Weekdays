# Contributing to WeekDays

Thank you for your interest in contributing to WeekDays! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
- [Development Workflow](#development-workflow)
  - [Branch Naming](#branch-naming)
  - [Commit Messages](#commit-messages)
  - [Pull Requests](#pull-requests)
- [Code Style](#code-style)
  - [Backend (Java)](#backend-java)
  - [Frontend (TypeScript/React)](#frontend-typescriptreact)
- [Testing](#testing)
- [Project Structure](#project-structure)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Prerequisites

- **Java 21** — [Download from Adoptium](https://adoptium.net/)
- **Node.js 22+** — [Download from nodejs.org](https://nodejs.org/)
- **Docker 24+** (optional, for containerized setup)
- **PostgreSQL 16** (optional, Docker provides this)

### Local Setup

**1. Clone and prepare the repository:**

```bash
git clone https://github.com/karthikJKST/weekdays.git
cd weekdays
```

**2. Start the database:**

```bash
docker compose up -d postgres
```

**3. Start the backend:**

```bash
cd backend
./mvnw spring-boot:run
```

The backend starts at `http://localhost:8080` with the `dev` profile, which uses an in-memory H2 database and auto-seeds demo data.

**4. Start the frontend** (in a separate terminal):

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:5173` and connects to the backend at `http://localhost:8080/api/v1`.

**5. Open the application:**

Navigate to [http://localhost:5173](http://localhost:5173) and click **"Login as Demo"** to explore.

## Development Workflow

### Branch Naming

Use descriptive branch names that follow these conventions:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/task-comments` |
| `fix/` | Bug fixes | `fix/login-validation` |
| `refactor/` | Code improvements | `refactor/api-error-handling` |
| `docs/` | Documentation | `docs/api-endpoints` |
| `chore/` | Maintenance | `chore/update-dependencies` |

Format: `<type>/<short-description>` (kebab-case)

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>: <brief description>

<optional body with additional context>
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`

Examples:
```
feat: add task comment support
fix: resolve login validation edge case
docs: update API endpoint documentation
```

### Pull Requests

1. **Create a feature branch** from `main` (see branch naming above)
2. **Make your changes** following the code style guidelines
3. **Write or update tests** for your changes
4. **Run the test suite** to ensure nothing is broken:
   ```bash
   # Backend
   cd backend && mvn test
   
   # Frontend
   cd frontend && npm run build
   ```
5. **Push your branch** and open a pull request against `main`
6. **PR description** should include:
   - What the change does
   - Why it's needed
   - Any related issues or tickets
   - Screenshots for UI changes

### PR Checklist

- [ ] Code follows project style conventions
- [ ] Tests pass (`mvn test` for backend, `npm run build` for frontend)
- [ ] New tests added for new functionality
- [ ] Documentation updated (if applicable)
- [ ] No new warnings introduced
- [ ] Commit messages follow conventional format

## Code Style

### Backend (Java)

- **Language level:** Java 21
- **Package naming:** `com.weekdays.api.<domain>` (e.g., `com.weekdays.api.task`)
- **Class naming:** PascalCase (e.g., `TaskService`, `AuthController`)
- **Method naming:** camelCase (e.g., `findByEmailIgnoreCase`)
- **Constructor injection:** Use constructor-based dependency injection (single constructor — no `@Autowired` needed)
- **DTOs:** Use Java records for request/response DTOs
- **Entities:** Use `jakarta.persistence` annotations (Jakarta EE)
- **Error handling:** Use `ResponseStatusException` for API errors; `GlobalExceptionHandler` for global handling
- **Database migrations:** Add a new Flyway migration (`.sql` file) for schema changes — never modify existing migrations

### Frontend (TypeScript/React)

- **Language:** TypeScript (strict mode)
- **Component naming:** PascalCase (e.g., `LoginPage`, `TaskCard`)
- **File naming:** camelCase for utilities (`authStore.ts`), PascalCase for components (`LoginPage.tsx`)
- **Hooks:** Use React hooks for state and effects
- **State management:** Zustand for global auth state; React Query for server state
- **Styling:** Tailwind CSS utility classes
- **API calls:** Use the Axios client in `src/api/client.ts` (interceptors handle auth tokens)
- **Forms:** Use React Hook Form with validation

## Testing

### Backend Tests

```bash
cd backend
mvn test
```

The backend uses:
- **JUnit 5** for unit and integration tests
- **`@WebMvcTest`** for controller tests
- **`@DataJpaTest`** for repository tests
- **`@SpringBootTest`** for integration tests

### Frontend Tests

The frontend currently uses type-checking at build time (`tsc`). Run:

```bash
cd frontend
npm run build
```

This validates TypeScript types and builds the production bundle.

## Project Structure

```
WeekDays/
├── backend/               # Spring Boot 3 REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/weekdays/api/  # Source code
│   │   │   └── resources/              # Config, migrations
│   │   └── test/                       # Tests
│   └── Dockerfile
├── frontend/              # React 19 SPA
│   ├── src/
│   │   ├── api/           # API client and hooks
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── store/         # Zustand stores
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   └── vercel.json
├── docs/                  # Documentation
└── docker-compose.yml     # Local development
```

---

Thank you for contributing! 🚀
