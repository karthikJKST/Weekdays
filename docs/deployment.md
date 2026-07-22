# Deployment

## Architecture

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  Vercel  │──────▶│  Render  │──────▶│  Neon    │
│ Frontend │       │ Backend  │       │ Postgres │
│ (React)  │◀──────│ (Spring) │◀──────│  (DB)    │
└──────────┘       └──────────┘       └──────────┘
```

## Prerequisites

- [Vercel](https://vercel.com) account
- [Render](https://render.com) account
- [Neon](https://neon.tech) account

## Step-by-Step

### 1. Database — Neon

```bash
# 1. Create a Neon project
# 2. From the dashboard, copy the JDBC connection string:
#    jdbc:postgresql://ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
# 3. Note the username and password
```

### 2. Backend — Render

The project includes a `render.yaml` Blueprint for infrastructure-as-code:

```bash
# 1. Push repository to GitHub
# 2. In Render dashboard → New + → Blueprint
# 3. Connect your GitHub repository
# 4. Render creates the Web Service automatically
# 5. Set environment variables in Render dashboard:
```

#### Required Environment Variables

| Variable                | Source                                |
|-------------------------|---------------------------------------|
| `DATABASE_URL`          | Neon JDBC connection string           |
| `DATABASE_USERNAME`     | Neon database user                    |
| `DATABASE_PASSWORD`     | Neon database password                |
| `JWT_SECRET`            | Generate: `openssl rand -base64 64`   |
| `CORS_ALLOWED_ORIGIN`   | Your Vercel frontend URL              |
| `SPRING_PROFILES_ACTIVE`| `production`                          |

### 3. Frontend — Vercel

```bash
# 1. In Vercel dashboard → Add New → Project
# 2. Import your GitHub repository
# 3. Set Root Directory to `frontend`
# 4. Vercel auto-detects Vite framework
# 5. Add environment variable:
```

| Variable                | Value                                         |
|-------------------------|-----------------------------------------------|
| `VITE_API_BASE_URL`     | `https://your-render-app.onrender.com/api/v1` |

## Verification

After deployment, run the production smoke test:

```bash
# Health check
curl -s https://YOUR_RENDER_URL/actuator/health

# Register a user
TOKEN=$(curl -s -X POST https://YOUR_RENDER_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Demo","email":"demo@test.com","password":"Demo123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

# Test all endpoints
for endpoint in auth/me projects tasks calendar analytics/dashboard timeline; do
  echo "=== $endpoint ==="
  curl -s -H "Authorization: Bearer $TOKEN" \
    "https://YOUR_RENDER_URL/api/v1/$endpoint" | python3 -m json.tool
done

# Verify frontend loads
curl -s -o /dev/null -w "Frontend: %{http_code}\n" https://YOUR_VERCEL_URL
```

## Docker (Local)

```bash
# Start all services
docker compose up --build

# Access
# Frontend: http://localhost
# Backend:  http://localhost:8080
# DB:       localhost:5432

# Stop
docker compose down

# Reset database
docker compose down -v
```
