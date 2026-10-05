@echo off
REM ============================================================
REM Face Attendance System - Windows Startup Script
REM ============================================================

echo ============================================================
echo Face Attendance System - Docker Startup
echo ============================================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env >nul 2>&1
    echo.
    echo [IMPORTANT] Please edit .env and set the following:
    echo   - JWT_SECRET
    echo   - DB_PASSWORD
    echo   - SUPER_ADMIN credentials
    echo   - MAIL_PASSWORD
    echo.
    echo After editing .env, run this script again.
    echo.
    pause
    exit /b 0
)

echo [OK] .env file found
echo.

echo Starting all services...
echo This may take a few minutes on first run.
echo.
echo - Downloading Docker images
echo - Building containers
echo - Starting MySQL, Redis, Python, Backend, Frontend
echo - Downloading InsightFace model (~50MB)
echo.

REM Start Docker Compose
docker compose up --build

echo.
echo ============================================================
echo Services stopped
echo ============================================================
pause
