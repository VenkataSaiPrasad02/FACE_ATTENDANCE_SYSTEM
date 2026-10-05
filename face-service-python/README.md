# Face Recognition Attendance Management System 🎓

A comprehensive face recognition-based attendance tracking system for educational institutions.

## 🌟 Features

### For Administrators & Faculty
- **Student Management** - Register students with face enrollment
- **Course & Section Management** - Organize classes and groups
- **Attendance Sessions** - Create geofenced attendance sessions with time limits
- **Real-time Monitoring** - Track attendance in real-time
- **Reports & Analytics** - View attendance statistics and reports
- **Secure Authentication** - JWT-based authentication with role-based access

### For Students
- **Self-Service Attendance** - Mark attendance using face recognition
- **Geofence Validation** - Must be within campus radius to mark attendance
- **Profile Management** - Update profile and re-register face if needed
- **Attendance History** - View personal attendance records

### Technical Features
- **Face Detection** - Powered by InsightFace with Buffalo model
- **Face Recognition** - Cosine similarity-based matching with configurable threshold
- **Real-time Processing** - Fast face embedding generation and comparison
- **Secure Storage** - Face embeddings stored securely, images not retained
- **Performance Monitoring** - Built-in instrumentation for optimization
- **RESTful API** - Well-documented Swagger/OpenAPI endpoints

---

## 🏗️ Architecture

### Components
1. **Frontend** - React 18 + Vite + TailwindCSS
2. **Backend** - Java Spring Boot 3.x + Spring Security + JPA
3. **Face Service** - Python FastAPI + InsightFace + OpenCV
4. **Database** - MySQL 8.0
5. **Cache** - Redis (for OTP and sessions)

### Tech Stack

**Frontend:**
- React 18
- Vite (build tool)
- TailwindCSS
- Axios
- React Router

**Backend:**
- Java 21
- Spring Boot 3.x
- Spring Security (JWT)
- Spring Data JPA
- MySQL Connector

**Face Recognition Service:**
- Python 3.14
- FastAPI
- InsightFace (buffalo_s model)
- OpenCV
- ONNX Runtime
- NumPy

**Infrastructure:**
- MySQL 8.0
- Redis 7
- Docker & Docker Compose

---

## 🚀 Getting Started

### Option 1: Docker (Recommended)

**Prerequisites:**
- Docker Desktop installed and running
- 8GB RAM minimum

**Steps:**
1. Clone the repository:
```bash
git clone https://github.com/VenkataSaiPrasad02/FACE_ATTENDANCE_SYSTEM.git
cd FACE_ATTENDANCE_SYSTEM
```

2. Configure environment:
```bash
copy .env.example .env
# Edit .env with your configuration
```

3. Start all services:
```bash
docker compose up --build
```

4. Access the application:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080/api
- **Face Service:** http://localhost:8000/docs
- **API Documentation:** http://localhost:8080/swagger-ui.html

📖 **See [DOCKER_README.md](DOCKER_README.md) for complete Docker documentation.**

---

### Option 2: Manual Setup

#### Prerequisites
- Java 21 JDK
- Maven 3.9+
- Node.js 20+
- Python 3.14+
- MySQL 8.0
- Redis 7
- Git

#### 1. Database Setup
```bash
mysql -u root -p
CREATE DATABASE face_attendance;
CREATE USER 'faceapp'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON face_attendance.* TO 'faceapp'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. Backend Setup
```bash
cd backend-java

# Configure application.properties (or use environment variables)
# Set all required environment variables:
# - DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - SUPER_ADMIN_USERNAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
# - FACE_SERVICE_URL=http://localhost:8000
# - FRONTEND_URL=http://localhost:5173
# - REDIS_HOST=localhost, REDIS_PORT=6379

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend will start on http://localhost:8080

#### 3. Face Service Setup
```bash
cd face-service-python

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn app.main:app --reload
```

Face service will start on http://localhost:8000

**Note:** On first run, InsightFace will download the Buffalo model (~100MB). This is a one-time download.

#### 4. Frontend Setup
```bash
cd frontend-UI

# Install dependencies
npm install

# Create .env.local (optional - for custom backend URL)
echo VITE_API_BASE_URL= > .env.local

# Start development server
npm run dev
```

Frontend will start on http://localhost:5173

#### 5. Redis Setup
```bash
# Install and start Redis
# Windows: Use WSL or download from https://redis.io/download
# Linux: sudo apt-get install redis-server && redis-server
# Mac: brew install redis && redis-server
```

---

## 🎯 Usage

### First Time Setup

1. **Access the application** at http://localhost:5173

2. **Login as Super Admin** using the credentials you configured:
   - Username: `SUPER_ADMIN_USERNAME` from .env
   - Password: `SUPER_ADMIN_PASSWORD` from .env

3. **Create courses, sections, and faculty accounts**

4. **Register students:**
   - Add student details
   - Capture face photo using webcam
   - System generates face embedding
   - Student can now use their face for attendance

### Marking Attendance

**For Faculty/Admin:**
1. Create an attendance session
2. Set location (geofence center), radius, and duration
3. Students can now mark attendance

**For Students:**
1. Navigate to active attendance session
2. Allow camera access in browser
3. Face will be captured and compared
4. Attendance marked if:
   - Face matches registered face (above threshold)
   - Within geofence radius
   - Within session time window

---

## 🔐 Security

### Authentication
- JWT-based authentication
- Role-based access control (ADMIN, FACULTY, STUDENT)
- Secure password hashing (BCrypt)
- Token expiration and refresh

### Data Protection
- Face images not stored permanently
- Only face embeddings (512-dimensional vectors) are stored
- Database credentials via environment variables
- CORS configured for specific origins
- Input validation and sanitization

### Privacy
- Face embeddings cannot be reverse-engineered to original images
- Student data access restricted by role
- Attendance data encrypted in transit (HTTPS in production)

---

## 📊 Face Recognition Details

### How It Works

1. **Face Registration:**
   ```
   Student Photo → Face Detection → Face Alignment → 
   Embedding Generation (512D vector) → Store in Database
   ```

2. **Attendance Recognition:**
   ```
   Live Camera Frame → Face Detection → Face Alignment →
   Embedding Generation → Cosine Similarity with Registered Faces →
   Match if similarity > threshold → Mark Attendance
   ```

### Recognition Threshold
- Default: 0.6 (60% similarity)
- Configurable via `RECOGNITION_THRESHOLD` environment variable
- Higher threshold = stricter matching (fewer false positives)
- Lower threshold = more lenient matching (fewer false negatives)

### Model Information
- **Model:** InsightFace Buffalo_S
- **Size:** ~100MB
- **Architecture:** ResNet-based CNN
- **Embedding Size:** 512 dimensions
- **Processing:** CPU-optimized (default), GPU-capable

---

## 🛠️ Configuration

### Environment Variables

**Database:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=face_attendance
DB_USERNAME=faceapp
DB_PASSWORD=your_password
```

**JWT:**
```env
JWT_SECRET=your_256_bit_secret
JWT_EXPIRATION=86400000
```

**Super Admin:**
```env
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_FULL_NAME=Administrator
SUPER_ADMIN_PASSWORD=admin123
```

**Face Recognition:**
```env
RECOGNITION_THRESHOLD=0.6
MIN_FACE_QUALITY_SCORE=0.3
INSIGHTFACE_MODEL_NAME=buffalo_s
INSIGHTFACE_CTX_ID=-1  # -1 for CPU, 0 for GPU
```

**Services:**
```env
FACE_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 📱 Browser Compatibility

### Camera Access Requirements
- **Chrome/Edge:** Full support
- **Firefox:** Full support
- **Safari:** Requires HTTPS in production
- **Mobile browsers:** Full support on HTTPS

### Minimum Requirements
- Modern browser with WebRTC support
- Camera permissions granted
- JavaScript enabled
- Local storage enabled

---

## 🔧 Troubleshooting

### Camera Not Working
1. Check browser permissions (allow camera access)
2. Ensure HTTPS in production (HTTP works only on localhost)
3. Check if another app is using the camera
4. Try a different browser

### Face Not Detected
1. Ensure good lighting
2. Face directly toward the camera
3. Remove glasses/masks if possible
4. Check if face is within frame

### Recognition Fails
1. Re-register face with better quality photo
2. Lower recognition threshold (0.5 instead of 0.6)
3. Ensure consistent lighting between registration and recognition
4. Check face-service logs for errors

### Backend Connection Issues
1. Verify all services are running
2. Check environment variables
3. Verify MySQL/Redis are accessible
4. Check CORS configuration
5. Review backend logs: `docker compose logs -f backend`

---

## 📈 Performance Optimization

### Database
- Indexes on frequently queried columns
- Connection pooling configured
- Query optimization with JPA

### Face Recognition
- Model pre-loaded at startup (not per-request)
- Batch processing for multiple faces
- Caching of embeddings
- CPU-optimized inference

### Frontend
- Lazy loading of routes
- Image optimization
- Code splitting
- Production build minification

### Monitoring
- Built-in performance monitoring (disable in production)
- Request timing middleware
- Health check endpoints
- Detailed logging

---

## 🧪 Testing

### Manual Testing
1. Start all services
2. Access http://localhost:5173
3. Login as super admin
4. Create a test student
5. Register face
6. Create attendance session
7. Mark attendance using face recognition

### API Testing
- Swagger UI: http://localhost:8080/swagger-ui.html
- Face Service Docs: http://localhost:8000/docs

### Health Checks
```bash
# Backend
curl http://localhost:8080/actuator/health

# Face Service
curl http://localhost:8000/health
```

---

## 📄 API Documentation

### Backend API
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs

### Face Service API
- **Interactive Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Main Endpoints

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Student registration

**Students:**
- `GET /api/students` - List all students
- `POST /api/students` - Create student
- `POST /api/students/{id}/face` - Register face

**Attendance:**
- `POST /api/attendance/sessions` - Create session
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/sessions/{id}/records` - Get attendance records

**Face Service:**
- `POST /face/register` - Register face embedding
- `POST /face/recognize` - Recognize face
- `GET /health` - Health check

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Venkata Sai Prasad** - [GitHub](https://github.com/VenkataSaiPrasad02)

---

## 🙏 Acknowledgments

- **InsightFace** - Face recognition models
- **Spring Boot** - Backend framework
- **React** - Frontend library
- **FastAPI** - Python web framework
- **OpenCV** - Computer vision library

---

## 📞 Support

For issues, questions, or contributions:
- **GitHub Issues:** [Create an issue](https://github.com/VenkataSaiPrasad02/FACE_ATTENDANCE_SYSTEM/issues)
- **Documentation:** See [DOCKER_README.md](DOCKER_README.md) for Docker setup
- **Email:** Check repository for contact information

---

## 🗺️ Roadmap

### Planned Features
- [ ] Multi-face recognition in single frame
- [ ] Attendance reports export (PDF, Excel)
- [ ] Email notifications for attendance
- [ ] Mobile app (React Native)
- [ ] Facial liveness detection (anti-spoofing)
- [ ] Attendance analytics dashboard
- [ ] Integration with Learning Management Systems
- [ ] Backup and restore functionality

### Performance Improvements
- [ ] GPU acceleration for face recognition
- [ ] Caching layer for frequent queries
- [ ] WebSocket for real-time updates
- [ ] Image compression and optimization

---

**🎉 Thank you for using Face Attendance System!**

If you find this project helpful, please ⭐ star the repository!
