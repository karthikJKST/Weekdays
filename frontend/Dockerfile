# ── Build stage ──────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first (cache layer)
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
COPY . .
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# ── Runtime stage ────────────────────────────────────────
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx config and static files
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend assets
COPY --from=build /app/dist .

# Create non-root user for nginx
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /etc/nginx/conf.d /usr/share/nginx/html

USER nginx

# Healthcheck
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=5s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
