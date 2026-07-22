# ── Build stage ──────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Download dependencies first (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build application
COPY src ./src
RUN mvn package -DskipTests -q

# ── Runtime stage ────────────────────────────────────────
FROM eclipse-temurin:21-jre
WORKDIR /app

# Create non-root user
RUN groupadd --system appuser && \
    useradd --system --gid appuser --no-create-home appuser

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

# Security: drop root privileges
USER appuser

# Healthcheck
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=30s \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
