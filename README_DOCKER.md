# Face Attendance System - Docker Quick Start

## 🚀 One-Command Setup

```bash
# 1. Copy environment template
copy .env.example .env

# 2. Edit .env and set JWT_SECRET, passwords, etc.
notepad .env

# 3. Start everything
docker compose up --build
```

**That's it!** Open http://localhost:5173 in your browser.

---

## 📋 Requirements

- **Docker Desktop** (Windows/Mac/Linux)
- Minimum 4GB RAM allocated to Docker
- Internet connection (first run downloads ~500MB)

---

## 🎯 What Gets Installed

Docker will automatically set up:
- ✅ MySQL 8.0 database
- ✅ Redis cache
- ✅ Python FastAPI face recognition service (+ InsightFace Buffalo model)
- ✅ Spring Boot Java backend
- ✅ React frontend with Vite

**No manual installation needed** for Python, Node.js, MySQL, etc.

---

## 🔧 Configuration

### Required Environment Variables

Edit `.env` and set these:

```bash
# Generate with: openssl rand -base64 32
JWT_SECRET=your-64-character-random-string-here

# Database password
DB_PASSWORD=secure-password-123

# Super admin credentials
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=Admin@123!

# Gmail app password for email
MAIL_PASSWORD=your-gmail-app-password
```

All other variables have sensible defaults.

---

## 🌐 Access URLs

Once started (wait ~2 minutes for first-time setup):

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Main application UI |
| **Backend API** | http://localhost:8080 | REST API |
| **API Docs** | http://localhost:8080/swagger-ui.html | Swagger UI |
| **Python Service** | http://localhost:8000 | Face recognition API |
| **Python Docs** | http://localhost:8000/docs | FastAPI docs |

---

## 📱 Camera Access

**Important**: The webcam is accessed by your **browser**, not by Docker.

- Click "Allow" when browser asks for camera permission
- Works on: Desktop, laptop, tablet, phone
- Requires: HTTPS or localhost

Docker containers do NOT need camera device access.

---

## 💾 Data Persistence

Your data survives container restarts:

- ✅ MySQL database (students, attendance, face embeddings)
- ✅ Redis cache (OTP codes)
- ✅ InsightFace model files (~50MB, downloads once)
- ✅ Uploaded profile photos

To **delete all data**:
```bash
docker compose down -v
```

---

## 🛠️ Common Commands

### Start
```bash
# Start all services (foreground with logs)
docker compose up

# Start in background
docker compose up -d

# Rebuild and start
docker compose up --build
```

### Stop
```bash
# Stop services (keeps data)
docker compose stop

# Stop and remove containers (keeps data)
docker compose down

# Stop and DELETE ALL DATA
docker compose down -v
```

### Logs
```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f backend
docker compose logs -f python-face-service
docker compose logs -f frontend
```

### Status
```bash
# Check running services
docker compose ps

# Check service health
docker inspect face-attendance-backend --format='{{.State.Health.Status}}'
```

---

## 🐛 Troubleshooting

### Services won't start?
```bash
# Check logs
docker compose logs -f

# Check Docker is running
docker info

# Restart everything
docker compose restart
```

### Backend can't connect to MySQL?
- Wait 30-60 seconds for MySQL to initialize
- Check: `docker compose ps` (mysql should be "healthy")

### Camera not working?
- Check browser permissions (click lock icon in address bar)
- Only works on HTTPS or localhost
- Try Chrome/Edge (best support)
- **Not a Docker issue** - camera is browser-based

### Port conflict?
```
Error: port is already allocated
```
- Another service is using 3306, 5173, 8000, or 8080
- Stop the conflicting service or change ports in docker-compose.yml

### Out of memory?
- Increase Docker Desktop memory (Settings → Resources)
- Recommended: 8GB

---

## 🔄 Development Workflow

### Making Code Changes

**Frontend (React)**:
- Changes auto-reload instantly (HMR)

**Backend (Java)**:
```bash
docker compose up --build backend
```

**Python Service**:
```bash
docker compose up --build python-face-service
```

### Database Reset
```bash
# WARNING: Deletes all data!
docker compose down -v
docker compose up --build
```

---

## 📊 Service Architecture

```
Browser (Camera) 
    ↓ Base64 image
Frontend (React:5173) 
    ↓ /api/* proxy
Backend (Spring Boot:8080)
    ↓ HTTP requests
    ├─→ MySQL (3306) - Data storage
    ├─→ Redis (6379) - Cache
    └─→ Python (8000) - Face recognition
```

---

## ✅ First Login

After starting:
1. Open http://localhost:5173
2. Login with super admin credentials (from .env):
   - Username: `admin`
   - Password: `Admin@123!` (or your SUPER_ADMIN_PASSWORD)
3. Start using the system!

---

## 📚 Full Documentation

- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - Complete Docker guide
- **[ARCHITECTURE_REPORT.md](./ARCHITECTURE_REPORT.md)** - System architecture

---

## 🆘 Need Help?

1. Check logs: `docker compose logs -f`
2. Check service status: `docker compose ps`
3. Read DOCKER_SETUP.md troubleshooting section
4. Open GitHub issue with logs

---

## 🎓 For Your Friend

Send them this:

> **Face Attendance System - Setup (5 minutes)**
> 
> 1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
> 2. Clone: `git clone https://github.com/VenkataSaiPrasad02/FACE_ATTENDANCE_SYSTEM.git`
> 3. Copy `.env.example` to `.env` and edit it
> 4. Run: `docker compose up --build`
> 5. Open: http://localhost:5173
> 
> That's it! No Python, Node.js, or MySQL installation needed.

---

**Made with ❤️ by VenkataSaiPrasad02**
