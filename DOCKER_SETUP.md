# Face Attendance System - Docker Setup Guide

## Prerequisites

- **Docker Desktop** installed and running
  - Windows: Download from https://www.docker.com/products/docker-desktop/
  - Minimum: 4GB RAM allocated to Docker
  - Recommended: 8GB RAM allocated to Docker

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/VenkataSaiPrasad02/FACE_ATTENDANCE_SYSTEM.git
cd FACE_ATTENDANCE_SYSTEM
```

### 2. Configure Environment Variables
```bash
# Copy the example environment file
copy .env.example .env

# Edit .env and set required values:
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - DB_PASSWORD
# - SUPER_ADMIN_USERNAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
# - MAIL_PASSWORD (Gmail App Password)
```

**IMPORTANT**: Never commit `.env` to version control!

### 3. Start All Services
```bash
docker compose up --build
```

This will:
- ✅ Download and build all Docker images
- ✅ Start MySQL, Redis, Python face service, Java backend, React frontend
- ✅ Download InsightFace Buffalo model (~50MB) on first run
- ✅ Auto-create database tables
- ✅ Create super admin account

### 4. Access the Application

Once all services are healthy:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Python Face Service**: http://localhost:8000
- **API Documentation**: http://localhost:8080/swagger-ui.html

**Default Login** (after setting in .env):
- Username: `admin` (or your SUPER_ADMIN_USERNAME)
- Password: `Admin@123!ChangeMe` (or your SUPER_ADMIN_PASSWORD)

---

## Docker Commands Reference

### Start Services
```bash
# Start all services (foreground, with logs)
docker compose up

# Start all services (background)
docker compose up -d

# Start with rebuild (after code changes)
docker compose up --build

# Start specific service
docker compose up mysql
```

### Stop Services
```bash
# Stop all services (keeps containers)
docker compose stop

# Stop and remove containers (keeps volumes)
docker compose down

# Stop and remove everything including volumes (DELETES DATA!)
docker compose down -v
```

### View Logs
```bash
# All services
docker compose logs

# Follow logs (real-time)
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 python-face-service
```

### Rebuild Services
```bash
# Rebuild all
docker compose build

# Rebuild specific service
docker compose build backend

# Rebuild and start
docker compose up --build
```

### Service Health Check
```bash
# Check running containers
docker compose ps

# Check service health
docker inspect face-attendance-backend --format='{{.State.Health.Status}}'
```

### Access Container Shell
```bash
# Backend (Java)
docker exec -it face-attendance-backend bash

# Python service
docker exec -it face-attendance-python bash

# MySQL
docker exec -it face-attendance-mysql mysql -u root -p
```

### Clean Up
```bash
# Remove stopped containers
docker compose down

# Remove containers + volumes (DELETES ALL DATA)
docker compose down -v

# Remove unused images
docker image prune -a

# Remove everything (nuclear option)
docker system prune -a --volumes
```

---

## Data Persistence

### Volumes
The following data persists across container restarts:

| Volume | Purpose | Location |
|--------|---------|----------|
| `mysql_data` | Database (students, attendance, embeddings) | `/var/lib/mysql` |
| `redis_data` | Cache (OTP, sessions) | `/data` |
| `insightface_models` | Buffalo face recognition model | `/root/.insightface` |
| `uploads_data` | Profile photos | `/app/uploads` |

### Backup Data
```bash
# Backup MySQL
docker exec face-attendance-mysql mysqldump -u root -p face_attendance > backup.sql

# Restore MySQL
docker exec -i face-attendance-mysql mysql -u root -p face_attendance < backup.sql

# Backup volumes
docker run --rm -v face-attendance-mysql-data:/data -v ${PWD}:/backup alpine tar czf /backup/mysql-backup.tar.gz /data
```

### Reset Data
```bash
# WARNING: This deletes ALL data!
docker compose down -v
docker compose up --build
```

---

## Troubleshooting

### Services Won't Start

**Check logs:**
```bash
docker compose logs -f
```

**Common issues:**
- **MySQL not ready**: Wait 30 seconds for initialization
- **Port conflict**: Another service using 3306, 5173, 8000, or 8080
- **Insufficient memory**: Increase Docker Desktop memory allocation

### Backend Can't Connect to MySQL

**Symptoms:**
```
Could not open JPA EntityManager for transaction
Connection refused
```

**Solution:**
- Wait for MySQL healthcheck to pass: `docker compose ps`
- Check environment variables: `docker compose config`
- Restart backend: `docker compose restart backend`

### Python Service Model Download Fails

**Symptoms:**
```
InsightFace unavailable
Failed to download buffalo_s
```

**Solution:**
- Check internet connection
- Increase startup timeout in docker-compose.yml
- Download manually:
```bash
docker exec -it face-attendance-python python -c "from insightface.app import FaceAnalysis; FaceAnalysis(name='buffalo_s').prepare(ctx_id=-1)"
```

### Frontend Can't Reach Backend

**Symptoms:**
- Login fails
- Network errors in browser console

**Solution:**
- Check backend health: `docker compose ps`
- Check CORS configuration: `FRONTEND_URL=http://localhost:5173`
- Clear browser cache
- Try in incognito mode

### Camera Not Working

**Important**: Camera is accessed by **browser**, not Docker!

**Check:**
- Browser has camera permission (click lock icon in address bar)
- Using HTTPS or localhost (camera requires secure context)
- Camera not in use by another app
- Try different browser (Chrome recommended)

**Not a Docker issue** - camera access is browser-based via WebRTC.

### Database Permission Denied

**Symptoms:**
```
Access denied for user 'faceadmin'@'%'
```

**Solution:**
```bash
# Reset and recreate database
docker compose down -v
docker compose up --build
```

### Out of Memory

**Symptoms:**
- Container crashes
- Slow performance
- OOM killed

**Solution:**
- Increase Docker Desktop memory limit (Settings → Resources)
- Recommended: 8GB for all services
- Minimum: 4GB

---

## Development Workflow

### Code Changes

**Frontend (React):**
- Hot module reload works automatically
- Changes reflected immediately in browser

**Backend (Java):**
```bash
# Rebuild and restart
docker compose up --build backend
```

**Python Service:**
```bash
# Rebuild and restart
docker compose up --build python-face-service
```

### Database Migrations

**Schema changes** are handled automatically by Hibernate `ddl-auto=update`.

To reset schema:
```bash
docker compose down -v
docker compose up --build
```

### Testing

```bash
# Run backend tests
docker exec -it face-attendance-backend mvn test

# Run Python tests
docker exec -it face-attendance-python pytest
```

---

## Production Deployment

### Environment Variables

**Critical - Change these for production:**
- `JWT_SECRET`: Strong random string (64+ characters)
- `DB_PASSWORD`: Strong database password
- `SUPER_ADMIN_PASSWORD`: Strong admin password
- `STUDENT_INITIAL_PASSWORD`: Complex initial password

### Security

- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Restrict CORS origins (set `FRONTEND_URL`)
- [ ] Use strong passwords
- [ ] Enable firewall rules
- [ ] Regular backups
- [ ] Monitor logs

### Performance

- [ ] Use production build for frontend
- [ ] Enable connection pooling (MySQL)
- [ ] Configure Redis persistence
- [ ] Monitor resource usage
- [ ] Scale services if needed

### Frontend Production Build

Modify `Dockerfile.frontend` to use production build:
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Docker Host                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐      ┌────────────────┐             │
│  │   Frontend   │      │    Backend     │             │
│  │ React + Vite │─────▶│  Spring Boot   │             │
│  │  Port 5173   │      │   Port 8080    │             │
│  └──────────────┘      └────────┬───────┘             │
│                                  │                      │
│                         ┌────────┼────────┐            │
│                         │        │        │            │
│                    ┌────▼───┐ ┌─▼────┐ ┌─▼──────────┐ │
│                    │ MySQL  │ │Redis │ │   Python   │ │
│                    │  8.0   │ │  7   │ │  FastAPI   │ │
│                    │ 3306   │ │ 6379 │ │ InsightFace│ │
│                    └────────┘ └──────┘ │  Port 8000 │ │
│                                        └────────────┘ │
│                                                         │
│  Volumes: mysql_data, redis_data, insightface_models,  │
│           uploads_data                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Service Details

### Frontend (React + Vite)
- **Technology**: React 18, Vite 5, Tailwind CSS
- **Port**: 5173
- **Health**: `http://localhost:5173`
- **Hot Reload**: Enabled

### Backend (Spring Boot)
- **Technology**: Java 17, Spring Boot 3.2.5, Maven
- **Port**: 8080
- **Health**: `http://localhost:8080/actuator/health`
- **API Docs**: `http://localhost:8080/swagger-ui.html`

### Python Face Service
- **Technology**: Python 3.11, FastAPI, InsightFace
- **Port**: 8000
- **Health**: `http://localhost:8000/health`
- **Model**: Buffalo_s (CPU mode)

### MySQL
- **Version**: 8.0
- **Port**: 3306
- **Database**: `face_attendance`
- **User**: `faceadmin` (configurable)

### Redis
- **Version**: 7 Alpine
- **Port**: 6379
- **Persistence**: AOF enabled

---

## Support

For issues or questions:
1. Check logs: `docker compose logs -f`
2. Check service health: `docker compose ps`
3. Review this guide's troubleshooting section
4. Open GitHub issue with logs attached

---

## Credits

Face Attendance System by VenkataSaiPrasad02
- Repository: https://github.com/VenkataSaiPrasad02/FACE_ATTENDANCE_SYSTEM
- Face Recognition: InsightFace (Buffalo_s model)
- Architecture: Microservices with React + Spring Boot + FastAPI
