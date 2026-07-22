# Changelog

## v1.0.0 (2026-07-22)

### Initial Release

WeekDays is a dark-first engineering execution platform for planning projects, coordinating teams, and delivering software.

#### Features

- **Authentication** — JWT-based registration and login with access/refresh token rotation. Secure password hashing with BCrypt.
- **Project Management** — Full CRUD for projects with Kanban board view, grid view, and list view. Drag-and-drop status updates.
- **Task Management** — Create, update, delete, archive, and restore tasks. Grid, table, and timeline views. Bulk operations, filtering, sorting, and search.
- **Calendar** — Month, week, day, and agenda views with drag-and-drop event rescheduling. Mini calendar navigation.
- **Timeline** — Chronological activity feed with pagination. Automatic activity generation from projects, tasks, and calendar events.
- **Analytics Dashboard** — Real-time metrics including project progress, task completion rates, team workload, priority and status distributions, and recent activity.
- **Application Shell** — Collapsible sidebar, global search, notification panel, user menu with profile/settings/logout.
- **Docker Support** — Multi-stage Dockerfiles, Docker Compose with PostgreSQL, nginx reverse proxy, and health checks.

#### Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Query, React Router, React Hook Form |
| Backend    | Spring Boot 3, Java 21, JPA/Hibernate, Flyway, JWT, BCrypt                          |
| Database   | PostgreSQL 16                                    |
| DevOps     | Docker, Docker Compose, Nginx, Render, Vercel, Neon                                   |

#### Deployment

- **Frontend:** Vercel (SPA with Nginx)
- **Backend:** Render (Spring Boot 3 via Docker)
- **Database:** Neon (PostgreSQL 16 with built-in connection pooling)

For detailed setup instructions, see [README.md](./README.md).
