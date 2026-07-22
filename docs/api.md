# API Reference

Base URL: `https://your-render-app.onrender.com/api/v1`

All endpoints return JSON. Protected endpoints require `Authorization: Bearer <token>`.

---

## Authentication

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

**Response** `201 Created`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "role": "OWNER"
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

**Response** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
  "user": { "id": "...", "fullName": "Jane Doe", "email": "jane@example.com", "role": "OWNER" }
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
{ "id": "...", "fullName": "Jane Doe", "email": "jane@example.com", "role": "OWNER" }
```

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{ "refreshToken": "dGhpcyBpcyBhIHJlZnJl..." }
```

**Response** `200 OK`
```json
{ "accessToken": "...", "refreshToken": "...", "user": { ... } }
```

---

## Projects

All endpoints require `Authorization: Bearer <token>`.

### List Projects

```http
GET /projects
```

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "WeekDays Platform",
    "description": "Engineering execution platform",
    "status": "in_progress",
    "priority": "high",
    "color": "indigo",
    "dueDate": "2026-08-01",
    "taskCount": 12,
    "completedTaskCount": 5,
    "createdAt": "2026-06-01T10:00:00Z",
    "updatedAt": "2026-07-22T14:30:00Z"
  }
]
```

### Get Project

```http
GET /projects/{id}
```

### Create Project

```http
POST /projects
Content-Type: application/json

{
  "name": "New Project",
  "description": "Description",
  "status": "in_progress",
  "priority": "medium",
  "color": "indigo",
  "dueDate": "2026-09-01"
}
```

### Update Project

```http
PUT /projects/{id}
Content-Type: application/json
```

### Update Project Status

```http
PATCH /projects/{id}/status
Content-Type: application/json

{ "status": "done" }
```

### Delete Project

```http
DELETE /projects/{id}
```

---

## Tasks

All endpoints require `Authorization: Bearer <token>`.

### List Tasks

```http
GET /tasks?projectId=uuid
```

### Get Task

```http
GET /tasks/{id}
```

### Create Task

```http
POST /tasks
Content-Type: application/json

{
  "title": "Implement auth",
  "description": "JWT auth module",
  "projectId": "uuid",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-08-15",
  "assigneeName": "Alice",
  "estimatedHours": 8,
  "labels": []
}
```

### Update Task

```http
PUT /tasks/{id}
```

### Update Task Status

```http
PATCH /tasks/{id}/status
Content-Type: application/json

{ "status": "in_progress" }
```

### Update Task Priority

```http
PATCH /tasks/{id}/priority
Content-Type: application/json

{ "priority": "high" }
```

### Delete Task

```http
DELETE /tasks/{id}
```

### Archive / Restore

```http
PATCH /tasks/{id}/archive
PATCH /tasks/{id}/restore
```

### Assign / Unassign

```http
PATCH /tasks/{id}/assign   { "assigneeName": "Bob", "assigneeId": "" }
PATCH /tasks/{id}/unassign
```

### Special Lists

```http
GET /tasks/today
GET /tasks/upcoming
GET /tasks/overdue
GET /tasks/completed
GET /tasks/archived
GET /tasks/search?q=keyword
```

### Bulk Operations

```http
PATCH  /tasks/bulk/status   { "ids": [...], "status": "done" }
PATCH  /tasks/bulk/priority { "ids": [...], "priority": "high" }
PATCH  /tasks/bulk/archive  { "ids": [...] }
PATCH  /tasks/bulk/restore  { "ids": [...] }
DELETE /tasks/bulk          { "ids": [...] }
```

---

## Calendar Events

All endpoints require `Authorization: Bearer <token>`.

### List Events

```http
GET /calendar
GET /calendar/month?year=2026&month=7
GET /calendar/week?date=2026-07-20
GET /calendar/day?date=2026-07-22
GET /calendar/range?from=2026-07-01&to=2026-07-31
```

### Create Event

```http
POST /calendar
Content-Type: application/json

{
  "title": "Sprint Planning",
  "description": "Weekly planning session",
  "eventType": "meeting",
  "startTime": "2026-07-22T10:00:00",
  "endTime": "2026-07-22T11:00:00",
  "allDay": false,
  "color": "indigo",
  "location": "Conference Room A",
  "projectId": null
}
```

### Update / Delete

```http
PUT    /calendar/{id}
DELETE /calendar/{id}
```

---

## Analytics

```http
GET /analytics/dashboard
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
{
  "summary": {
    "totalProjects": 5,
    "activeProjects": 3,
    "completedProjects": 2,
    "totalTasks": 42,
    "completedTasks": 18,
    "inProgressTasks": 10,
    "overdueTasks": 3,
    "upcomingTasks": 7,
    "completionRate": 42.86,
    "productivityScore": 71,
    "tasksCompletedThisWeek": 4,
    "tasksCompletedThisMonth": 12,
    "totalEstimatedHours": 168,
    "totalSpentHours": 142,
    "totalMembers": 4
  },
  "statusDistribution": [
    { "label": "todo", "value": 14, "color": "#64748b" },
    { "label": "in_progress", "value": 10, "color": "#6366f1" },
    { "label": "done", "value": 18, "color": "#10b981" }
  ],
  "priorityDistribution": [...],
  "projectHealth": [...],
  "teamWorkload": [...],
  "recentActivity": [...]
}
```

---

## Timeline

```http
GET /timeline?page=0&size=20
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
{
  "items": [
    {
      "id": "task-created-abc",
      "type": "task_created",
      "title": "Implement auth",
      "description": "Task created in WeekDays Platform",
      "projectId": "uuid",
      "projectName": "WeekDays Platform",
      "taskId": "uuid",
      "calendarEventId": null,
      "timestamp": "2026-07-22T14:30:00Z",
      "actor": "Alice",
      "icon": "plus-circle",
      "color": "indigo"
    }
  ],
  "page": 0,
  "size": 20,
  "totalPages": 3,
  "totalItems": 42
}
```

## Health

```http
GET /health
```

**Response** `200 OK`
```json
{ "status": "UP" }
```
