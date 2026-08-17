# Backend — Face Attendance System

Spring Boot 3 / Java 17 REST API.

## Quick Start (Windows)

### Prerequisites
- Java 17+
- Maven 3.9+
- MySQL 8 running with `face_attendance` database

### Setup

```cmd
cd backend-java
copy .env.example .env
```

Edit `.env` with your MySQL credentials and JWT secret, then load variables into your shell or IDE before running.

### Run

```cmd
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.jpa.hibernate.ddl-auto=validate"
```

Or set environment variables and run:

```cmd
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=face_attendance
set DB_USERNAME=xxxx
set DB_PASSWORD=yourpassword
set JWT_SECRET=your_super_secret_key_min_32_chars_here
set FACE_SERVICE_URL=http://localhost:8000
mvn spring-boot:run
```

## Environment Variables

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port (default 3306) |
| `DB_NAME` | Database name |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `JWT_EXPIRATION` | Token TTL in ms (default 86400000 = 24h) |
| `FACE_SERVICE_URL` | Python service URL |
| `FRONTEND_URL` | React app URL for CORS |

## API Documentation

Swagger UI: http://localhost:8080/swagger-ui.html

## Running Tests

```cmd
mvn test
```

## Build JAR

```cmd
mvn clean package -DskipTests
java -jar target/face-attendance-backend-1.0.0.jar
```
