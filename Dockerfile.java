# ============================================================
# Spring Boot Backend Dockerfile
# ============================================================
# Multi-stage build for Maven + Java 17
# ============================================================

FROM maven:3.9-eclipse-temurin-17 AS builder

# Set working directory
WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .

# Download dependencies (cached layer).
# `dependency:go-offline` is only a cache-warming optimisation - it is known
# to fail on projects whose plugins it cannot pre-resolve. It is therefore
# non-fatal: if it fails, the `mvn package` step below simply downloads
# whatever is still missing.
RUN mvn dependency:go-offline -B || echo "go-offline incomplete; remaining deps resolve during package"

# Copy source code
COPY src ./src

# Build the application. -DskipTests still compiles test sources, so a
# broken test compile fails the image build. Verified locally: passes.
RUN mvn clean package -DskipTests -B

# ============================================================
# Final stage
# ============================================================
FROM eclipse-temurin:17-jre-jammy

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Create uploads directory for profile photos
RUN mkdir -p /app/uploads/profiles

# Expose port
EXPOSE 8080

# Health check
#
# There is NO spring-boot-starter-actuator dependency in pom.xml, so
# /actuator/health does not exist and answers 404. The application's own
# public liveness route is GET /api/face/health (FaceController#health),
# which SecurityConfig permits for anonymous callers. Probing a
# non-existent endpoint here makes this container never report healthy,
# which in turn blocks the frontend via `depends_on: service_healthy`.
HEALTHCHECK --interval=15s --timeout=5s --start-period=90s --retries=10 \
    CMD curl -f http://localhost:8080/api/face/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
