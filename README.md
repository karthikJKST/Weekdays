# WeekDays

[![Java](https://img.shields.io/badge/Java-21-%23ED8B00?logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-%236DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-%2361DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-%233178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-%234169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-%232496ED?logo=docker)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-%23000000?logo=jsonwebtokens)](https://jwt.io/)
[![Vite](https://img.shields.io/badge/Vite-8-%23646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**WeekDays** is a dark-first engineering execution platform for planning projects, coordinating teams, and delivering software. It combines a modern React SPA frontend with a production-grade Spring Boot API and PostgreSQL database.

---

## Features

### 📋 Project Management
- Kanban board, grid, and list views
- Create, edit, delete, and archive projects
- Drag-and-drop status updates
- Status, progress, priority, and due date tracking

### ✅ Task Management
- Grid, table, and Kanban views
- Full CRUD with archive/restore
- Multi-select bulk operations (status, priority, archive, delete)
- Filtering by status, priority, assignee, project, due date, labels
- Sorting and search
- Checklist and comments

### 📅 Calendar
- Month, week, day, and agenda views
- Drag-and-drop event rescheduling
- Mini calendar navigation
- Quick filters for tasks, projects, meetings, milestones

### 📊 Analytics Dashboard
- Real-time project and task metrics
- Status and priority distribution charts
- Project health monitoring
- Team workload analysis
- Recent activity feed

### ⏱ Timeline
- Chronological activity feed
- Auto-generated from projects, tasks, and calendar events
- Paginated with "load more"
- Grouped by date

### 🔐 Authentication
- JWT-based with access/refresh token rotation
- Secure password hashing (BCrypt)
- Persistent sessions across browser restarts

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Query, React Router, React Hook Form, Axios, Lucide Icons |
| **Backend**  | Spring Boot 3, Java 21, JPA/Hibernate, Flyway, JWT, BCrypt, PostgreSQL |
| **Database** | PostgreSQL 16 |
| **DevOps**   | Docker, Docker Compose, Nginx, Render, Vercel, Neon |

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌────────────┐
│  Frontend   │────▶│   Backend   │────▶│ PostgreSQL │
│  (Nginx +   │     │ (Spring Boot│     │  (Port     │
│   React)    │◀────│  on :8080)  │◀────│   :5432)   │
│   (Port 80) │     │             │     │            │
└─────────────┘     └─────────────┘     └────────────┘
                          │
                    ┌─────┴──────┐
                    │ Flyway DB  │
                    │ Migrations │
                    └────────────┘
```

See [docs/architecture.md](./docs/architecture.md) for detailed architecture documentation.

---

## Project Structure

```
WeekDays/
├── backend/               # Spring Boot 3 REST API
│   ├── src/
│   │   ├── main/java/com/weekdays/api/
│   │   │   ├── analytics/  # Dashboard metrics
│   │   │   ├── auth/       # JWT authentication
│   │   │   ├── calendar/   # Calendar events
│   │   │   ├── config/     # Security configuration
│   │   │   ├── project/    # Project management
│   │   │   ├── task/       # Task management
│   │   │   ├── timeline/   # Activity timeline
│   │   │   └── user/       # User entity
│   │   └── main/resources/
│   │       ├── application.yml
│   │       ├── application-production.yml
│   │       └── db/migration/  # Flyway migrations
│   └── Dockerfile
├── frontend/               # React 19 SPA
│   ├── src/
│   │   ├── api/           # React Query hooks
│   │   ├── components/    # UI components by domain
│   │   ├── layouts/       # Main app layout
│   │   ├── pages/         # Route-level pages
│   │   ├── store/         # Zustand auth store
│   │   └── types/         # TypeScript interfaces
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vercel.json
├── docs/                   # Documentation
│   ├── architecture.md
│   ├── deployment.md
│   └── api.md
├── screenshots/            # App screenshots
├── docker-compose.yml      # Docker development environment
├── render.yaml             # Render Blueprint deployment
├── CHANGELOG.md            # Release history
└── LICENSE                 # MIT license
```

---

## Quick Start (Docker)

```bash
# Prerequisites: Docker 24+ and Docker Compose V2

# Clone the repository
git clone https://github.com/YOUR_USERNAME/weekdays.git
cd weekdays

# Build and start all services
docker compose up --build

# Open in your browser
open http://localhost
```

The frontend proxies `/api/` requests to the backend automatically. No port configuration needed.

### Docker Commands

| Command | Description |
|---------|-------------|
| `docker compose up --build` | Start all services |
| `docker compose up -d --build` | Start in detached mode |
| `docker compose down` | Stop all services |
| `docker compose down -v` | Stop and delete database data |
| `docker compose logs -f` | Follow all logs |

---

## Local Development (without Docker)

```bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Start backend (Java 21 required)
cd backend
mvn spring-boot:run

# 3. Start frontend (in another terminal)
cd frontend
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:5173` and connects to `http://localhost:8080/api/v1`.

---

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/weekdays` | Yes | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | `postgres` | Yes | Database user |
| `DATABASE_PASSWORD` | `postgres` | Yes | Database password |
| `JWT_SECRET` | Dev-only default | Yes | JWT signing key (generate with `openssl rand -base64 64`) |
| `JWT_ACCESS_TOKEN_MINUTES` | `15` | No | Access token TTL |
| `JWT_REFRESH_TOKEN_DAYS` | `14` | No | Refresh token TTL |
| `CORS_ALLOWED_ORIGIN` | `http://localhost:5173` | Yes | Frontend URL for CORS |
| `PORT` | `8080` | No | Server port |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Yes | Backend API URL (frontend) |

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | — | Register new user |
| `POST` | `/api/v1/auth/login` | — | Login |
| `POST` | `/api/v1/auth/refresh` | — | Refresh access token |
| `GET` | `/api/v1/auth/me` | ✓ | Current user profile |
| `GET` | `/api/v1/health` | — | Health check |
| | | | |
| `GET` | `/api/v1/projects` | ✓ | List projects |
| `POST` | `/api/v1/projects` | ✓ | Create project |
| `PUT` | `/api/v1/projects/{id}` | ✓ | Update project |
| `PATCH` | `/api/v1/projects/{id}/status` | ✓ | Update project status |
| `DELETE` | `/api/v1/projects/{id}` | ✓ | Delete project |
| | | | |
| `GET` | `/api/v1/tasks` | ✓ | List tasks |
| `POST` | `/api/v1/tasks` | ✓ | Create task |
| `PUT` | `/api/v1/tasks/{id}` | ✓ | Update task |
| `PATCH` | `/api/v1/tasks/{id}/status` | ✓ | Update task status |
| `PATCH` | `/api/v1/tasks/{id}/priority` | ✓ | Update task priority |
| `DELETE` | `/api/v1/tasks/{id}` | ✓ | Delete task |
| `PATCH` | `/api/v1/tasks/{id}/archive` | ✓ | Archive task |
| `PATCH` | `/api/v1/tasks/{id}/restore` | ✓ | Restore task |
| | | | |
| `GET` | `/api/v1/calendar` | ✓ | List calendar events |
| `POST` | `/api/v1/calendar` | ✓ | Create event |
| `PUT` | `/api/v1/calendar/{id}` | ✓ | Update event |
| `DELETE` | `/api/v1/calendar/{id}` | ✓ | Delete event |
| | | | |
| `GET` | `/api/v1/analytics/dashboard` | ✓ | Analytics dashboard data |
| `GET` | `/api/v1/timeline` | ✓ | Activity timeline |

Full API documentation: [docs/api.md](./docs/api.md)

---

## Deployment

WeekDays is configured for production deployment across three managed services:

| Service | Platform | Technology |
|---------|----------|------------|
| Frontend | [Vercel](https://vercel.com) | React SPA via Vite |
| Backend | [Render](https://render.com) | Spring Boot 3 via Docker |
| Database | [Neon](https://neon.tech) | PostgreSQL 16 |

See [docs/deployment.md](./docs/deployment.md) for step-by-step deployment instructions.

---

## Future Improvements

- **Real-time collaboration** — WebSocket-based live updates for tasks and Kanban boards
- **Notifications** — Email and in-app notifications for deadlines, assignments, and mentions
- **File attachments** — Upload and attach files to tasks and calendar events
- **Time tracking** — Start/stop timer for tasks with automatic billing
- **Team management** — Invite members, assign roles, manage permissions
- **Mobile app** — React Native companion app for on-the-go access
- **Integrations** — GitHub, GitLab, Slack, Jira connectors
- **Dark/light theme** — Toggle between dark and light mode (currently dark-first)

---

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.
