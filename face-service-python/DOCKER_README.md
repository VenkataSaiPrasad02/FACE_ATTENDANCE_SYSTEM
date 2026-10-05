# Face Attendance System - Docker Setup Guide

Complete guide to run the Face Recognition Attendance Management System using Docker.

---

## 📋 Prerequisites

- **Docker Desktop** installed and running
  - Windows: [Download Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
  - Minimum 8GB RAM recommended
  - Enable WSL 2 backend (Windows 10/11)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/VenkataSaiPrasad02/FACE_ATTENDANCE_SYSTEM.git
cd FACE_ATTENDANCE_SYSTEM
```

### 2. Configure Environment Variables

Copy the example environment file and edit it with your values:

```bash
copy .env.example .env
```

**Required Changes in `.env`:**
- `JWT_SECRET` - Generate a strong secret (use `openssl rand -base64 32`)
- `DB_PASSWORD` - Set a secure database password
- `SUPER_ADMIN_USERNAME` - Your admin username
- `SUPER_ADMIN_EMAIL` - Your admin email
- `SUPER_ADMIN_PASSWORD` - Set a secure admin password

**Optional:**
- `MAIL_PASSWORD` - Gmail app password for OTP functionality

### 3. Start the Application

```bash
docker compose up --build
```

This command will:
- Build all Docker images (React frontend, Java backend, Python face service)
- Download the MySQL and Redis images
- Start all services
- Download the InsightFace Buffalo model on first run (~100MB)
- Initialize the database schema automatically

**First startup takes 5-10 minutes** for:
- Maven dependencies download
- npm packages installation
- Python packages installation
- InsightFace model download

### 4. Access the Application

Once all services are healthy (check logs), open:

**🌐 Frontend:** http://localhost:5173

**📡 Backend API:** http://localhost:8080/api

**🔬 Face Service:** http://localhost:8000/docs

**📊 Swagger UI:** http://localhost:8080/swagger-ui.html

### 5. Login

Use the super admin credentials you set in `.env`:
- Username: `SUPER_ADMIN_USERNAME`
- Password: `SUPER_ADMIN_PASSWORD`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Docker Compose                      │
└──────────────┬──────────────┬──────────────────────┘
               │              │
     ┌─────────┴───┐    ┌────┴──────┐
     │             │    │           │
┌────▼─────┐  ┌───▼───┐ ┌──▼──────┐ ┌──────────┐
│ Frontend │  │Backend│ │  Face   │ │  MySQL   │
│  React   │  │ Java  │ │ Service │ │  Redis   │
│  Vite    │  │Spring │ │ Python  │ │          │
│ :5173    │  │ :8080 │ │ FastAPI │ │ :3306    │
│          │  │       │ │  :8000  │ │ :6379    │
└──────────┘  └───┬───┘ └────┬────┘ └────┬─────┘
                  │          │           │
                  └──────────┴───────────┘
                    face-attendance-network
```

**Services:**
1. **frontend** - React UI with Vite (port 5173)
2. **backend** - Spring Boot API (port 8080)
3. **face-service** - Python FastAPI for face recognition (port 8000)
4. **mysql** - MySQL 8.0 database (port 3306)
5. **redis** - Redis for OTP/sessions (port 6379)

**Volumes (Persistent Data):**
- `mysql_data` - Database tables and records
- `redis_data` - Redis cache and sessions
- `insightface_models` - Buffalo model files (~100MB)
- `profile_photos` - Uploaded student profile photos

---

## 📹 Camera Access

### Browser Camera (Recommended)
The application uses **browser-based camera access** via WebRTC (`getUserMedia`).

**Requirements:**
1. The browser needs camera permissions
2. Must use **HTTPS** or **localhost** for camera access
3. On Windows, Docker Desktop does NOT need host camera access

**Camera Access Flow:**
```
User's Browser → getUserMedia API → Webcam
       ↓
  Capture Image
       ↓
Send to Backend (base64)
       ↓
Backend → Face Service (Python)
       ↓
Face Recognition Result
```

**Troubleshooting:**
- **Camera not working?** Check browser permissions (chrome://settings/content/camera)
- **HTTPS required?** For production, use HTTPS. For localhost testing, HTTP works fine.
- **Mobile testing:** The app should work on phones connected to the same network

---

## 🛠️ Docker Commands

### Start Services (Detached Mode)
```bash
docker compose up -d
```

### Stop Services
```bash
docker compose down
```

### Stop and Remove ALL Data (including database)
```bash
docker compose down -v
```
⚠️ **Warning:** This deletes the database, uploaded photos, and models!

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f face-service
docker compose logs -f frontend
docker compose logs -f mysql
```

### Rebuild After Code Changes
```bash
docker compose up --build
```

### Rebuild Specific Service
```bash
docker compose up --build backend
```

### Check Service Status
```bash
docker compose ps
```

### Enter Container Shell
```bash
docker compose exec backend sh
docker compose exec face-service sh
docker compose exec mysql bash
```

### View Database
```bash
docker compose exec mysql mysql -u faceapp -p face_attendance
# Enter the password from your .env file
```

---

## 🔍 Troubleshooting

### Issue: "MySQL not ready" errors in backend logs

**Solution:** Wait 30-60 seconds. The backend retries automatically. MySQL needs time to initialize on first startup.

### Issue: Face service fails with "Model download error"

**Solution:** 
1. Check internet connection
2. The InsightFace model downloads automatically on first run
3. Delete the volume and retry:
```bash
docker compose down -v
docker volume rm face_attendance_system_insightface_models
docker compose up --build
```

### Issue: Frontend shows "Network Error"

**Solution:**
1. Check backend is running: `docker compose logs backend`
2. Ensure CORS is configured properly (should be automatic)
3. Try clearing browser cache

### Issue: "Port already in use"

**Solution:** Change ports in `.env`:
```
DB_PORT=3307
REDIS_PORT=6380
```

Or stop conflicting services:
```bash
# Check what's using the port
netstat -ano | findstr :8080
```

### Issue: Out of disk space during build

**Solution:** Clean up Docker:
```bash
docker system prune -a --volumes
```

### Issue: Backend crashes with "JWT_SECRET not set"

**Solution:** Make sure `.env` file exists and `JWT_SECRET` is configured.

---

## 📊 Data Persistence

### What Survives `docker compose down`?
✅ MySQL database data
✅ Uploaded profile photos
✅ InsightFace models
✅ Redis data

### What Gets Deleted?
❌ Container logs
❌ Temporary files inside containers

### Complete Reset (Fresh Start)
```bash
docker compose down -v
docker compose up --build
```
This removes ALL data including:
- All users and attendance records
- All uploaded photos
- Downloaded models (will be re-downloaded)

---

## 🔐 Security Notes

### For Development:
The `.env.example` contains placeholder values. **Never commit `.env` to Git.**

### For Production:
1. Use strong passwords (20+ characters)
2. Change `JWT_SECRET` to a cryptographically secure random string
3. Enable HTTPS (use reverse proxy like Nginx)
4. Restrict database access
5. Set `DEBUG=false` and `PERFORMANCE_MONITORING=false`
6. Configure proper CORS origins (not `*`)

---

## 📈 Performance Notes

### InsightFace Model
- **Model:** Buffalo_S (lightweight, CPU-optimized)
- **First startup:** Downloads ~100MB model
- **Subsequent starts:** Uses cached model from volume
- **CPU Mode:** Set `INSIGHTFACE_CTX_ID=-1` (default)
- **GPU Mode:** Set `INSIGHTFACE_CTX_ID=0` (requires CUDA)

### Resource Usage (Approximate)
- **MySQL:** ~400MB RAM
- **Redis:** ~50MB RAM
- **Backend (Java):** ~500MB RAM
- **Face Service (Python):** ~800MB RAM (with model loaded)
- **Frontend (Node):** ~200MB RAM

**Total:** ~2GB RAM minimum

---

## 🧪 Testing the Setup

### 1. Health Checks
```bash
# Backend
curl http://localhost:8080/actuator/health

# Face Service
curl http://localhost:8000/health

# Frontend
curl http://localhost:5173
```

### 2. Test Face Service Directly
Open: http://localhost:8000/docs

Try the `/health` endpoint.

### 3. Test Face Registration Flow
1. Login as super admin
2. Add a new student
3. Upload their photo (face registration)
4. Check logs: `docker compose logs -f face-service`

---

## 🆘 Getting Help

### Check Logs First
```bash
docker compose logs -f backend
docker compose logs -f face-service
```

### Common Log Messages

**Backend:**
- ✅ `Started FaceAttendanceApplication` - Backend ready
- ❌ `Connection refused: mysql` - MySQL not ready yet (wait)
- ❌ `JWT_SECRET not set` - Configure `.env`

**Face Service:**
- ✅ `Face detection models loaded successfully` - Ready
- ⚠️ `Downloading model...` - First startup (wait ~2 minutes)

### Service Dependencies
```
MySQL/Redis (start first)
    ↓
Backend (waits for MySQL)
    ↓
Frontend (waits for Backend)
```

---

## 🔄 Development Workflow

### Making Code Changes

**Backend Changes:**
```bash
# Stop only backend
docker compose stop backend
# Rebuild and restart
docker compose up --build backend
```

**Face Service Changes:**
```bash
docker compose stop face-service
docker compose up --build face-service
```

**Frontend Changes:**
```bash
docker compose stop frontend
docker compose up --build frontend
```

### Live Development (Alternative)

For faster development, you can run services locally and only use Docker for MySQL/Redis:

```bash
# Start only database services
docker compose up mysql redis

# Run backend locally
cd backend-java
mvn spring-boot:run

# Run face service locally
cd face-service-python
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn app.main:app --reload

# Run frontend locally
cd frontend-UI
npm run dev
```

---

## 📦 Ports Reference

| Service      | Internal Port | External Port | Access URL |
|--------------|---------------|---------------|------------|
| Frontend     | 5173          | 5173          | http://localhost:5173 |
| Backend      | 8080          | 8080          | http://localhost:8080 |
| Face Service | 8000          | 8000          | http://localhost:8000 |
| MySQL        | 3306          | 3306          | localhost:3306 |
| Redis        | 6379          | 6379          | localhost:6379 |

---

## ✅ Success Criteria

Your setup is working correctly when:

1. ✅ All 5 services show as "healthy" in `docker compose ps`
2. ✅ Frontend loads at http://localhost:5173
3. ✅ You can login with super admin credentials
4. ✅ Backend API responds at http://localhost:8080/api/auth/test
5. ✅ Face service shows "healthy" at http://localhost:8000/health
6. ✅ Camera permissions work in the browser
7. ✅ Face registration captures and processes images
8. ✅ Attendance marking works with face recognition

---

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

**Questions or Issues?** Open an issue on GitHub or check the logs with `docker compose logs -f`.
