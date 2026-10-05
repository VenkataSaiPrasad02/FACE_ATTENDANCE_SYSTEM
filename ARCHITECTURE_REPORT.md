# Face Attendance System - Complete Architecture Report

## Executive Summary

The Face Attendance System is a **3-tier microservices architecture**:
- **Frontend**: React + Vite (port 5173)
- **Backend**: Spring Boot + Java 17 (port 8080)  
- **Face Service**: Python FastAPI + InsightFace (port 8000)
- **Database**: MySQL (port 3306)
- **Cache**: Redis (port 6379)

---

## 1. Frontend (React + Vite)

### Technology Stack
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.3.1
- **UI Library**: Tailwind CSS 4.3.3
- **HTTP Client**: Axios 1.7.2
- **Router**: React Router DOM 6.24.0
- **Image Cropping**: React Easy Crop 6.2.3

### Key Dependencies
```json
{
  "axios": "^1.7.2",
  "lucide-react": "^1.31.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-easy-crop": "^6.2.3",
  "react-router-dom": "^6.24.0",
  "react-toastify": "^10.0.5"
}
```

### Startup Commands
```bash
# Development
npm run dev          # Starts Vite dev server on port 5173

# Production
npm run build        # Creates dist/ folder
npm start            # Runs server.js (Express) serving dist/
```

### Configuration
**File**: `.env`
```bash
# VITE_API_BASE_URL=    # Empty = same-origin (default)
# Only set when backend is on different domain
VITE_API_BASE_URL=
```

### Camera Access
**File**: `frontend-UI/src/components/PolishedCameraCapture.jsx`
- Uses **browser WebRTC API**: `navigator.mediaDevices.getUserMedia()`
- Captures video stream in browser
- Takes snapshots to `<canvas>`
- Encodes to Base64 JPEG/PNG
- Sends to backend via REST API

**Critical**: Camera is accessed by **browser JavaScript**, NOT by Python/OpenCV. The React component accesses the user's webcam through the browser's permission system.

### API Communication
**File**: `frontend-UI/src/services/api.js`
- Axios instance with JWT interceptor
- Base URL: `import.meta.env.VITE_API_BASE_URL || ''` (same-origin by default)
- All requests go to `/api/*` endpoints
- JWT stored in localStorage
- 401 → redirect to `/login`
- 403 → check password change requirement

### Vite Configuration
**File**: `frontend-UI/vite.config.js`
```javascript
server: {
  host: '0.0.0.0',
  port: 5173,
  proxy: {
    '/api': {
      target: process.env.BACKEND_ORIGIN || 'http://localhost:8080',
      changeOrigin: true,
    },
    '/uploads': {
      target: process.env.BACKEND_ORIGIN || 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

---

## 2. Backend (Spring Boot + Java)

### Technology Stack
- **Framework**: Spring Boot 3.2.5
- **Java Version**: 17
- **Build Tool**: Maven
- **ORM**: JPA + Hibernate
- **Security**: Spring Security + JWT (JJWT 0.12.5)
- **Documentation**: SpringDoc OpenAPI 2.5.0

### Key Dependencies
```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
  </dependency>
  <dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
  </dependency>
</dependencies>
```

### Startup Command
```bash
mvn spring-boot:run
# OR
java -jar target/face-attendance-backend-1.0.0.jar
```

### Database Configuration
**File**: `backend-java/src/main/resources/application.properties`
```properties
# Database
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:face_attendance}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
spring.jpa.hibernate.ddl-auto=update

# Face Service
face.service.url=${FACE_SERVICE_URL:http://localhost:8000}

# Redis
spring.data.redis.host=${REDIS_HOST:localhost}
spring.data.redis.port=${REDIS_PORT:6379}

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}

# CORS
cors.allowed-origins=${FRONTEND_URL:http://localhost:5173}

# Recognition
recognition.threshold=${RECOGNITION_THRESHOLD:0.6}

# Student Initial Password
app.student.initial-password=${STUDENT_INITIAL_PASSWORD:student@123}

# Attendance Session
app.attendance.radius-meters=${ATTENDANCE_RADIUS_METERS:50}
app.attendance.session-duration-minutes=${ATTENDANCE_SESSION_MINUTES:10}

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=prasadfb46@gmail.com
spring.mail.password=${MAIL_PASSWORD}

# Super Admin
app.super-admin.username=${SUPER_ADMIN_USERNAME}
app.super-admin.email=${SUPER_ADMIN_EMAIL}
app.super-admin.full-name=${SUPER_ADMIN_FULL_NAME}
app.super-admin.password=${SUPER_ADMIN_PASSWORD}

# Performance Monitoring
performance.monitoring=${PERFORMANCE_MONITORING:true}
```

### MySQL Database
- **Database Name**: `face_attendance` (configurable via `DB_NAME`)
- **Schema Management**: Hibernate `ddl-auto=update` (auto-creates tables)
- **No SQL initialization scripts** - schema created by JPA entities
- **Main Tables** (inferred from typical structure):
  - Users (admins, teachers)
  - Students (with face embeddings)
  - Attendance records
  - Attendance sessions
  - Academic periods
  - Holidays

### Redis Usage
- **OTP storage** for password reset
- **Session state** for password recovery flow
- **Port**: 6379

### Face Service Integration
**Java → Python Communication**:
1. **Registration Flow**:
   - React captures image → Java receives Base64
   - Java → `POST /api/face/register` → Python
   - Python detects face, extracts embedding (InsightFace)
   - Returns embedding to Java
   - Java stores embedding in MySQL

2. **Sync Flow**:
   - Java → `POST /api/face/sync` → Python
   - Java sends ALL student embeddings
   - Python rebuilds in-memory matrix
   - Called on: startup, after register/update/delete

3. **Recognition Flow**:
   - React captures image → Java receives Base64
   - Java → `POST /api/face/recognize` → Python
   - Python detects face, extracts embedding
   - Python compares against in-memory matrix (vectorized cosine similarity)
   - Returns match result (student_id, confidence) to Java
   - Java handles attendance business logic

---

## 3. Python Face Service (FastAPI + InsightFace)

### Technology Stack
- **Framework**: FastAPI 0.111.0
- **ASGI Server**: Uvicorn 0.29.0
- **Face Recognition**: InsightFace 0.7.3
- **Computer Vision**: OpenCV 4.9.0.80 (headless)
- **ML Runtime**: ONNX Runtime 1.18.0
- **Numerical**: NumPy 1.25.2

### Python Dependencies
**File**: `face-service-python/requirements.txt`
```txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
python-dotenv==1.0.1
pydantic==2.13.4
numpy==1.25.2
opencv-python-headless==4.9.0.80
httpx==0.27.0
Pillow==9.5.0
pytest==8.2.0
pytest-asyncio==0.23.6
insightface==0.7.3
onnxruntime==1.18.0
psutil
```

### Startup Command
```bash
# Development
python -m app.main
# OR
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Configuration
**File**: `face-service-python/app/core/config.py`
```python
class Settings:
    APP_NAME: str = "Face Recognition Service"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PYTHON_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Face recognition
    RECOGNITION_THRESHOLD: float = float(os.getenv("RECOGNITION_THRESHOLD", "0.5"))
    MIN_FACE_QUALITY_SCORE: float = float(os.getenv("MIN_FACE_QUALITY_SCORE", "0.3"))
    
    # InsightFace
    INSIGHTFACE_MODEL_NAME: str = os.getenv("INSIGHTFACE_MODEL_NAME", "buffalo_s")
    INSIGHTFACE_CTX_ID: int = int(os.getenv("INSIGHTFACE_CTX_ID", "-1"))  # -1 = CPU
    
    PERFORMANCE_MONITORING: bool = os.getenv("PERFORMANCE_MONITORING", "true").lower() == "true"
```

### InsightFace Integration
**File**: `face-service-python/app/services/face_detection_service.py`

**Model**: Buffalo_s (small)
```python
from insightface.app import FaceAnalysis

self._insightface_app = FaceAnalysis(
    name="buffalo_s",
    providers=["CPUExecutionProvider"],
    allowed_modules=["detection", "recognition"],
)

self._insightface_app.prepare(
    ctx_id=-1,  # CPU
    det_size=(320, 320),
)
```

**Model Loading**:
- Loads at **application startup** (in `main.py` `lifespan` manager)
- Singleton pattern - loaded once, reused for all requests
- **Buffalo model files**:
  - Auto-downloaded by InsightFace to: `~/.insightface/models/buffalo_s/`
  - Files: `det_10g.onnx`, `w600k_r50.onnx` (recognition model)
- Fallback: OpenCV Haar Cascade if InsightFace fails

### Face Embedding Generation
**Process**:
1. Decode Base64 image → NumPy BGR array
2. `FaceAnalysis.get(image)` → detects faces + extracts embeddings in ONE call
3. Each face has: `bbox`, `det_score`, `embedding` (512-dim float32)
4. Normalize embedding: L2 normalization
5. Return as Python list of floats

**Important**: Embedding extraction happens DURING face detection, not as a separate step. This is efficient - no need to re-process the image.

### Face Comparison (Cosine Similarity)
**File**: `face-service-python/app/services/embedding_store.py`

**In-Memory Storage**:
```python
class EmbeddingStore:
    _student_ids: List[int]
    _matrix: np.ndarray  # shape (N, 512), L2-normalized
```

**Vectorized Comparison**:
```python
def find_best_match(self, probe_embedding, threshold):
    # Normalize probe
    probe = np.asarray(probe_embedding, dtype=np.float32)
    probe = probe / np.linalg.norm(probe)
    
    # Vectorized cosine similarity - ALL candidates at once
    sims = matrix @ probe  # NumPy matrix multiplication
    
    best_idx = int(np.argmax(sims))
    best_similarity = float(sims[best_idx])
    
    matched = best_similarity >= threshold
    return matched, student_ids[best_idx] if matched else None, best_similarity
```

**No Python loops** - entire comparison is vectorized NumPy operation.

### API Endpoints
**File**: `face-service-python/app/api/routes/face_routes.py`

1. **POST /api/face/register**
   - Input: `student_id`, `image_base64`
   - Output: `embedding` (512-dim), `embedding_dim`, `message`
   - Does NOT store in Python - Java stores in MySQL

2. **POST /api/face/sync**
   - Input: `candidates` (list of {student_id, embedding})
   - Replaces entire in-memory matrix
   - Called by Java on startup + after register/update/delete

3. **POST /api/face/recognize**
   - Input: `image_base64`
   - Output: `matched`, `confidence`, `student_id`
   - Compares against in-memory candidates

4. **GET /health**
   - Returns service status

### OpenCV Usage
- **opencv-python-headless**: No GUI, server-safe
- Used for:
  - Image decoding (Base64 → NumPy array)
  - Fallback face detection (Haar Cascade) if InsightFace unavailable
- **Not used for webcam** - webcam is accessed by React/browser

---

## 4. Data Storage

### Face Embeddings
- **Generated**: Python FastAPI (InsightFace)
- **Stored**: MySQL (via Java backend)
- **Cached**: Python in-memory (NumPy matrix)
- **Sync**: Java pushes full snapshot to Python on changes

### Attendance Records
- **Stored**: MySQL (managed by Java)
- **Tables**: Attendance, AttendanceSession
- **Business Logic**: Java Spring Boot

### Profile Photos
- **Stored**: File system (`uploads/profiles/`)
- **Served**: Java backend at `/uploads/profiles/*`

### Temporary Data
- **OTP codes**: Redis (TTL-based expiry)
- **Password reset tokens**: Redis

---

## 5. Architecture Flow Diagrams

### Face Registration Flow
```
Browser (React)
    │ [Webcam captures image via getUserMedia]
    │
    ▼ Base64 JPEG/PNG
Java Backend (Spring Boot)
    │ POST /api/students/{id}/register-face
    │
    ▼ Forward Base64
Python Service (FastAPI)
    │ POST /api/face/register
    │ [InsightFace: detect + extract embedding]
    │
    ▼ Return embedding (512-dim)
Java Backend
    │ Store embedding in MySQL
    │
    ▼ Trigger sync
Python Service
    │ POST /api/face/sync
    │ [Rebuild in-memory matrix]
    │
    ▼ Response
React UI (success message)
```

### Face Recognition Flow
```
Browser (React)
    │ [Webcam captures image]
    │
    ▼ Base64 JPEG/PNG
Java Backend
    │ POST /api/attendance/recognize
    │
    ▼ Forward Base64
Python Service
    │ POST /api/face/recognize
    │ [Detect face → extract embedding → compare vs matrix]
    │
    ▼ Return {matched, student_id, confidence}
Java Backend
    │ [Validate session, geofence, business rules]
    │ [Create attendance record in MySQL]
    │
    ▼ Response
React UI (attendance marked!)
```

---

## 6. Environment Variables Summary

### Frontend (.env)
```bash
VITE_API_BASE_URL=              # Empty for same-origin
```

### Backend (application.properties or .env)
```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=face_attendance
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=
JWT_EXPIRATION=86400000

FACE_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

RECOGNITION_THRESHOLD=0.6
STUDENT_INITIAL_PASSWORD=student@123
ATTENDANCE_RADIUS_METERS=50
ATTENDANCE_SESSION_MINUTES=10

REDIS_HOST=localhost
REDIS_PORT=6379

MAIL_PASSWORD=
SUPER_ADMIN_USERNAME=
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_FULL_NAME=
SUPER_ADMIN_PASSWORD=

PERFORMANCE_MONITORING=true
```

### Python Face Service (.env)
```bash
HOST=0.0.0.0
PYTHON_PORT=8000
DEBUG=false

RECOGNITION_THRESHOLD=0.5
MIN_FACE_QUALITY_SCORE=0.3

INSIGHTFACE_MODEL_NAME=buffalo_s
INSIGHTFACE_CTX_ID=-1           # -1 = CPU, 0 = GPU

PERFORMANCE_MONITORING=true
```

---

## 7. Docker Architecture Proposal

### Proposed Services

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: face_attendance
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  python-face-service:
    build: ./face-service-python
    environment:
      HOST: 0.0.0.0
      PYTHON_PORT: 8000
      INSIGHTFACE_MODEL_NAME: buffalo_s
      INSIGHTFACE_CTX_ID: -1
      RECOGNITION_THRESHOLD: 0.5
    ports:
      - "8000:8000"
    volumes:
      - insightface_models:/root/.insightface
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  backend:
    build: ./backend-java
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: face_attendance
      DB_USERNAME: root
      DB_PASSWORD: rootpass
      REDIS_HOST: redis
      REDIS_PORT: 6379
      FACE_SERVICE_URL: http://python-face-service:8000
      JWT_SECRET: your-secret-key-here
      FRONTEND_URL: http://localhost:5173
      STUDENT_INITIAL_PASSWORD: student@123
      SUPER_ADMIN_USERNAME: admin
      SUPER_ADMIN_EMAIL: admin@example.com
      SUPER_ADMIN_FULL_NAME: Super Admin
      SUPER_ADMIN_PASSWORD: admin@123
      MAIL_PASSWORD: your-mail-password
    ports:
      - "8080:8080"
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
      python-face-service:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 15s
      timeout: 5s
      retries: 5

  frontend:
    build: ./frontend-UI
    environment:
      BACKEND_ORIGIN: http://backend:8080
      VITE_API_BASE_URL: ""
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  mysql_data:
  redis_data:
  insightface_models:
  uploads_data:
```

### Container Communication
```
frontend:5173  ──┐
                 │
                 ▼ /api/* proxy
              backend:8080 ──┐
                 │           │
                 │           ▼ HTTP
                 │  python-face-service:8000
                 │
                 ├──> mysql:3306
                 └──> redis:6379
```

### Critical Docker Considerations

#### 1. Camera Access
- **Webcam is accessed by BROWSER, not Docker containers**
- No special device mapping needed (`/dev/video0`)
- React component uses `getUserMedia()` which works through the browser
- Docker only needs to serve the frontend and handle Base64 image uploads

#### 2. Buffalo Model Download
- First run: InsightFace downloads Buffalo model (~50MB) to `~/.insightface/`
- Use Docker volume to persist: `insightface_models:/root/.insightface`
- Avoids re-downloading on container restart

#### 3. Database Initialization
- Hibernate `ddl-auto=update` auto-creates tables
- Use healthcheck + `depends_on` to ensure MySQL ready before backend starts

#### 4. Network Configuration
- All services in same Docker network
- Backend connects to MySQL via hostname `mysql` (not `localhost`)
- Python service accessed via `http://python-face-service:8000`

#### 5. Data Persistence
- MySQL data: `mysql_data` volume
- Redis data: `redis_data` volume
- Buffalo models: `insightface_models` volume
- Uploaded photos: `uploads_data` volume

---

## 8. Key Insights for Dockerization

### What Works Out of the Box
✅ React camera capture (browser-based, no Docker changes needed)  
✅ Base64 image encoding/decoding  
✅ InsightFace CPU mode (no GPU required)  
✅ OpenCV headless (no display required)  
✅ MySQL schema auto-creation (Hibernate)  
✅ Face embedding matrix in Python memory  

### What Needs Docker Configuration
🔧 Service hostname resolution (mysql, redis, python-face-service)  
🔧 Buffalo model persistence (volume mount)  
🔧 MySQL/Redis healthchecks (startup order)  
🔧 Upload directory persistence (bind mount or volume)  
🔧 Environment variables (DB connection, service URLs)  
🔧 CORS configuration (frontend URL)  

### What Should NOT Be Changed
🚫 Camera access mechanism (already browser-based)  
🚫 InsightFace/Buffalo (core face recognition)  
🚫 Base64 image transport (working correctly)  
🚫 Cosine similarity algorithm (vectorized, efficient)  
🚫 React component structure (camera works)  

---

## 9. Important Files for Dockerization

### Must Inspect/Modify
- `frontend-UI/package.json` - dependencies, build scripts
- `frontend-UI/vite.config.js` - proxy configuration
- `frontend-UI/.env` - API URL configuration
- `backend-java/pom.xml` - Maven dependencies
- `backend-java/src/main/resources/application.properties` - all configs
- `face-service-python/requirements.txt` - Python dependencies
- `face-service-python/app/core/config.py` - service configuration
- `face-service-python/app/main.py` - startup logic

### Should Not Need Changes
- `frontend-UI/src/components/PolishedCameraCapture.jsx` - camera logic
- `face-service-python/app/services/face_detection_service.py` - InsightFace
- `face-service-python/app/services/embedding_store.py` - vectorized comparison

---

## 10. Testing Checklist

### Infrastructure
- [ ] MySQL starts and accepts connections
- [ ] Redis starts and accepts connections
- [ ] Python service starts and loads Buffalo model
- [ ] Backend starts and connects to MySQL/Redis/Python
- [ ] Frontend starts and serves UI

### Functionality
- [ ] Frontend loads in browser
- [ ] Login works (JWT auth)
- [ ] Camera permission prompt appears
- [ ] Camera stream displays in React component
- [ ] Face registration: capture → send → embedding stored
- [ ] Python `/sync` endpoint receives embedding list
- [ ] Face recognition: capture → detect → match → attendance
- [ ] Profile photos uploaded and served
- [ ] Attendance records created in MySQL

### Performance
- [ ] Buffalo model loads in <10 seconds
- [ ] Face detection <500ms per image
- [ ] Face recognition <1 second total (including comparison)
- [ ] No repeated model loading (check logs)

---

## Summary

This is a well-architected face recognition attendance system with clear separation of concerns:

- **React handles UI + webcam capture** (browser WebRTC)
- **Python handles face recognition** (InsightFace + Buffalo)
- **Java handles business logic** (attendance rules, auth, CRUD)
- **MySQL stores persistent data** (embeddings, attendance, users)
- **Redis stores temporary data** (OTP, session state)

The architecture is **already Docker-ready** with only configuration changes needed. The camera access is **browser-based** so no special Docker device permissions are required.

**Next Steps**: Create Dockerfiles and docker-compose.yml based on this analysis.
