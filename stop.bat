@echo off
REM ============================================================
REM Face Attendance System - Windows Stop Script
REM ============================================================

echo ============================================================
echo Face Attendance System - Stopping Services
echo ============================================================
echo.

echo Stopping all containers...
docker compose stop

echo.
echo [OK] All services stopped
echo.
echo To remove containers (keeps data): docker compose down
echo To remove everything (DELETES DATA): docker compose down -v
echo.
pause
