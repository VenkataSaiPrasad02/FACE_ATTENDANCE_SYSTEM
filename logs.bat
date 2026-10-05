@echo off
REM ============================================================
REM Face Attendance System - View Logs
REM ============================================================

echo ============================================================
echo Face Attendance System - Service Logs
echo ============================================================
echo.
echo Press Ctrl+C to exit
echo.

docker compose logs -f
