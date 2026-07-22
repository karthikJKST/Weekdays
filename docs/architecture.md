# Architecture

## Overview

WeekDays follows a three-tier architecture with a React SPA frontend, a Spring Boot REST API backend, and a PostgreSQL database.

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                      │
│  ┌───────────────┐  ┌───────────────────────────────────┐   │
│  │  Static Asset  │  │  /api/  →  backend:8080           │   │
│  │  (React SPA)   │  │  SPA fallback → index.html        │   │
│  └───────────────┘  └───────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Spring Boot API (:8080)                     │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │  Auth    │  │ Project  │  │  Task    │  │  Calendar   │ │
│  │ Controller│  │Controller│  │Controller│  │ Controller  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘ │
│       │              │              │               │        │
│  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐  ┌─────▼──────┐ │
│  │  Auth    │  │ Project  │  │  Task    │  │  Calendar   │ │
│  │ Service  │  │ Service  │  │ Service  │  │  Service    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘ │
│       │              │              │               │        │
│  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐  ┌─────▼──────┐ │
│  │   JPA    │  │   JPA    │  │   JPA    │  │   JPA      │ │
│  │   Repo   │  │   Repo   │  │   Repo   │  │   Repo     │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐     │
│  │Analytics │  │ Timeline │  │  GlobalExceptionHandler │     │
│  │ Service  │  │ Service  │  │  + Security Config      │     │
│  └──────────┘  └──────────┘  └────────────────────────┘     │
└─────────────────────┬───────────────────────────────────────┘
                      │ JDBC (SSL)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL (:5432)                          │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │  users   │  │ projects │  │  tasks   │  │cal_events  │ │
│  │          │  │          │  │          │  │            │ │
│  │  refresh │  │          │  │          │  │            │ │
│  │  tokens  │  │          │  │          │  │            │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
│                                                               │
│  Flyway migrations manage all schema changes.                 │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

```
src/
├── api/           # React Query hooks + Axios client
├── components/    # Reusable UI components by domain
│   ├── analytics/ # Charts, stat cards, health lists
│   ├── calendar/  # Month/week/day/agenda views
│   ├── layout/    # Sidebar, navbar, search, user menu
│   ├── projects/  # Cards, grid, kanban, forms
│   ├── tasks/     # Cards, table, filters, drawer
│   ├── timeline/  # Skeleton, empty state
│   └── ui/        # Drawer, modal, card, page container
├── layouts/       # MainLayout (sidebar + navbar + content)
├── pages/         # Route-level page components
├── routes/        # ProtectedRoute, PublicRoute
├── store/         # Zustand auth store
├── types/         # TypeScript interfaces
└── utils/         # Shared utilities
```

### Key Patterns

- **State Management:** Zustand for auth, React Query for server state
- **API Client:** Single Axios instance with JWT interceptor and 401 redirect
- **Routing:** Protected routes redirect to `/login`; public routes redirect to `/`
- **Forms:** React Hook Form with client-side validation
- **Styling:** Tailwind CSS with dark theme and indigo accent

## Backend Architecture

```
src/main/java/com/weekdays/api/
├── analytics/    # Dashboard metrics and aggregations
├── auth/         # JWT auth, login, register, refresh
├── calendar/     # Calendar events CRUD
├── config/       # Security configuration
├── project/      # Project CRUD and status management
├── task/         # Task CRUD with filtering and bulk ops
├── timeline/     # Chronological activity feed
└── user/         # User entity and repository
```

### Key Patterns

- **RESTful controllers** with `@RestController` and `@RequestMapping("/api/v1")`
- **Service layer** with `@Transactional` business logic
- **Repository pattern** with Spring Data JPA
- **DTOs** as Java records for request/response
- **Owner isolation** — every query scoped to authenticated user
- **Flyway migrations** for database schema
- **Global exception handler** returning ProblemDetail JSON

## Security Flow

```
1. User registers or logs in → receives JWT access token + refresh token
2. Frontend stores token in Zustand (persisted to localStorage)
3. Axios interceptor attaches `Authorization: Bearer <token>` to all requests
4. JwtAuthenticationFilter validates token on every request
5. SecurityContext is populated with authenticated user
6. All queries filter by `owner_id` for data isolation
7. Expired tokens return 401; frontend redirects to login
```
